/**
 * Notification Service - Push, Email, SMS
 * @description Gestion complète des notifications utilisateur
 */
import { Pool } from 'pg';
import webpush from 'web-push';

let pool: Pool;

export const initNotificationService = (p: Pool): void => {
  pool = p;

  // Config Web Push (VAPID keys - À générer avec web-push generate-vapid-keys)
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
  const vapidEmail = process.env.VAPID_EMAIL || 'mailto:contact@mahagiri.fr';

  if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
  } else {
    console.warn('[Notifications] VAPID keys not configured - push notifications disabled');
  }
};

export const getUserPreferences = async (userId: string) => {
  const result = await pool.query(
    'SELECT * FROM notification_preferences WHERE user_id = $1',
    [userId]
  );
  if (result.rows.length === 0) {
    const created = await pool.query(
      'INSERT INTO notification_preferences (user_id) VALUES ($1) RETURNING *',
      [userId]
    );
    return created.rows[0];
  }
  return result.rows[0];
};

export const updateUserPreferences = async (userId: string, preferences: any) => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;
  const allowed = ['default_reminder_minutes', 'push_enabled', 'email_enabled', 'sms_enabled', 'in_app_enabled', 'quiet_hours_start', 'quiet_hours_end', 'timezone', 'push_subscription'];
  for (const field of allowed) {
    if (preferences[field] !== undefined) {
      fields.push(`${field} = $${paramIndex++}`);
      values.push(preferences[field]);
    }
  }
  if (fields.length === 0) return getUserPreferences(userId);
  values.push(userId);
  const result = await pool.query(`UPDATE notification_preferences SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = $${paramIndex} RETURNING *`, values);
  return result.rows[0];
};

export const scheduleEventReminders = async (eventId: string, userId: string, eventTitle: string, eventStart: Date, customReminders?: number[]) => {
  const prefs = await getUserPreferences(userId);
  const reminderMinutes = customReminders || prefs.default_reminder_minutes || [15, 60, 1440];
  const notifications = [];
  for (const minutes of reminderMinutes) {
    const scheduledFor = new Date(eventStart);
    scheduledFor.setMinutes(scheduledFor.getMinutes() - minutes);
    if (scheduledFor <= new Date()) continue;
    const isQuietHours = checkQuietHours(scheduledFor, prefs);
    if (isQuietHours) {
      scheduledFor.setHours(parseInt(prefs.quiet_hours_end.split(':')[0]), parseInt(prefs.quiet_hours_end.split(':')[1]), 0);
    }
    const timeLabel = formatReminderTime(minutes);
    if (prefs.push_enabled && prefs.push_subscription) {
      notifications.push(pool.query('INSERT INTO notifications_queue (user_id, event_id, notification_channel, scheduled_for, title, body, action_url, data) VALUES ($1, $2, \'push\', $3, $4, $5, $6, $7)', [userId, eventId, scheduledFor, `📅 ${eventTitle}`, `Commence ${timeLabel}`, `/calendar?event=${eventId}`, JSON.stringify({ eventId, minutes })]));
    }
    if (prefs.email_enabled) {
      notifications.push(pool.query('INSERT INTO notifications_queue (user_id, event_id, notification_channel, scheduled_for, title, body) VALUES ($1, $2, \'email\', $3, $4, $5)', [userId, eventId, scheduledFor, `Rappel: ${eventTitle}`, `Votre événement "${eventTitle}" commence ${timeLabel}.`]));
    }
    if (prefs.in_app_enabled) {
      notifications.push(pool.query('INSERT INTO notifications_queue (user_id, event_id, notification_channel, scheduled_for, title, body, action_url) VALUES ($1, $2, \'in_app\', $3, $4, $5, $6)', [userId, eventId, scheduledFor, `📅 ${eventTitle}`, `Commence ${timeLabel}`, `/calendar?event=${eventId}`]));
    }
  }
  await Promise.all(notifications);
  return { scheduled: notifications.length };
};

export const cancelEventReminders = async (eventId: string) => {
  await pool.query('UPDATE notifications_queue SET status = \'cancelled\', updated_at = NOW() WHERE event_id = $1 AND status = \'pending\'', [eventId]);
};

export const sendPushNotification = async (userId: string, title: string, body: string, actionUrl?: string, icon?: string) => {
  const prefs = await getUserPreferences(userId);
  if (!prefs.push_enabled || !prefs.push_subscription) throw new Error('Push notifications not enabled or subscription missing');
  const payload = JSON.stringify({ title, body, icon: icon || '/images/icon-192.png', badge: '/images/badge-96.png', data: { url: actionUrl || '/', timestamp: Date.now() }, actions: [{ action: 'open', title: 'Ouvrir' }, { action: 'close', title: 'Fermer' }] });
  try {
    await webpush.sendNotification(prefs.push_subscription, payload);
    return { success: true };
  } catch (error: any) {
    console.error('Push notification error:', error);
    if (error.statusCode === 410 || error.statusCode === 404) await updateUserPreferences(userId, { push_subscription: null });
    throw error;
  }
};

export const processPendingNotifications = async () => {
  const notifications = (await pool.query('SELECT * FROM notifications_queue WHERE status = \'pending\' AND scheduled_for <= NOW() AND retry_count < 3 ORDER BY scheduled_for ASC LIMIT 100')).rows;
  let sent = 0, failed = 0;
  for (const notif of notifications) {
    try {
      if (notif.notification_channel === 'push') {
        const prefs = await getUserPreferences(notif.user_id);
        if (prefs.push_subscription) await sendPushNotification(notif.user_id, notif.title, notif.body || '', notif.action_url, notif.icon_url);
      } else if (notif.notification_channel === 'email') {
        console.log('Email notification:', notif.title, 'to user', notif.user_id);
      }
      await pool.query('UPDATE notifications_queue SET status = \'sent\', sent_at = NOW(), updated_at = NOW() WHERE id = $1', [notif.id]);
      sent++;
    } catch (error: any) {
      console.error('Failed to send notification:', notif.id, error.message);
      await pool.query('UPDATE notifications_queue SET status = $1, retry_count = retry_count + 1, error_message = $2, updated_at = NOW() WHERE id = $3', [notif.retry_count >= 2 ? 'failed' : 'pending', error.message, notif.id]);
      failed++;
    }
  }
  return { sent, failed, processed: notifications.length };
};

export const getNotificationHistory = async (userId: string, limit = 50) => {
  const result = await pool.query('SELECT * FROM notifications_queue WHERE user_id = $1 AND sent_at IS NOT NULL ORDER BY sent_at DESC LIMIT $2', [userId, limit]);
  return result.rows;
};

export const sendTestNotification = async (userId: string) => {
  return sendPushNotification(userId, '🔔 Notification de test', 'Si vous voyez ceci, les notifications fonctionnent !', '/settings/notifications');
};

function formatReminderTime(minutes: number): string {
  if (minutes < 60) return `dans \${minutes} minute\${minutes > 1 ? 's' : ''}`;
  if (minutes < 1440) return `dans \${Math.floor(minutes / 60)} heure\${minutes >= 120 ? 's' : ''}`;
  return `dans \${Math.floor(minutes / 1440)} jour\${minutes >= 2880 ? 's' : ''}`;
}

function checkQuietHours(date: Date, prefs: any): boolean {
  if (!prefs.quiet_hours_start || !prefs.quiet_hours_end) return false;
  const hour = date.getHours();
  const minute = date.getMinutes();
  const currentTime = hour * 60 + minute;
  const [startH, startM] = prefs.quiet_hours_start.split(':').map(Number);
  const [endH, endM] = prefs.quiet_hours_end.split(':').map(Number);
  const startTime = startH * 60 + startM;
  const endTime = endH * 60 + endM;
  if (startTime > endTime) return currentTime >= startTime || currentTime <= endTime;
  return currentTime >= startTime && currentTime <= endTime;
}
