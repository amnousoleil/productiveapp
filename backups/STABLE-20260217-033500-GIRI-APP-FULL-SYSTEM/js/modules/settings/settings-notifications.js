/**
 * Settings Notifications - Ultra Premium UI v2.0
 * @description Interface haut de gamme avec animations et clarté
 */
const SettingsNotifications = (function() {
  'use strict';

  let prefs = null;
  let isSubscribed = false;

  async function render(container) {
    try {
      prefs = await Api.get('/notifications/preferences');
      const subscription = await WebPushUI.getSubscription();
      isSubscribed = !!subscription;

      container.innerHTML = `
        <div class="settings-notif-ultra">
          <!-- Hero Section avec illustration -->
          <div class="notif-hero">
            <div class="hero-visual">
              <div class="bell-animation">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                ${isSubscribed ? '<div class="active-pulse"></div>' : ''}
              </div>
            </div>
            <div class="hero-content">
              <h1 class="hero-title">Notifications Intelligentes</h1>
              <p class="hero-subtitle">Ne manquez jamais un événement important avec des rappels personnalisés</p>
              <div class="status-badge ${isSubscribed ? 'active' : 'inactive'}">
                <span class="badge-dot"></span>
                ${isSubscribed ? 'Actif' : 'Inactif'}
              </div>
            </div>
          </div>

          <!-- Quick Actions Cards Grid -->
          <div class="notif-grid">
            <!-- Card 1: Activation Push -->
            <div class="notif-card-premium main-card">
              <div class="card-glow"></div>
              <div class="card-header-flex">
                <div class="card-icon-wrapper">
                  <div class="icon-bg gradient-1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                  </div>
                </div>
                <div class="card-content-flex">
                  <h3>Notifications Push</h3>
                  <p>Recevez des alertes en temps réel sur votre bureau</p>
                </div>
                <label class="toggle-ultra ${isSubscribed ? 'checked' : ''}">
                  <input type="checkbox" id="push-toggle" ${isSubscribed ? 'checked' : ''}>
                  <span class="toggle-track">
                    <span class="toggle-thumb"></span>
                  </span>
                </label>
              </div>
              ${!isSubscribed ? `
                <div class="card-cta">
                  <button class="btn-activate" onclick="document.getElementById('push-toggle').click()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    Activer maintenant
                  </button>
                </div>
              ` : ''}
            </div>

            <!-- Card 2: Rappels Calendrier (expliqué clairement) -->
            <div class="notif-card-premium">
              <div class="card-glow"></div>
              <div class="card-header-simple">
                <div class="icon-bg gradient-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div>
                  <h3>Rappels Événements</h3>
                  <p class="card-desc">Délais de notification avant vos rendez-vous calendrier</p>
                </div>
              </div>
              <div class="reminder-showcase">
                ${renderReminderChips()}
              </div>
              <button class="btn-add-custom" onclick="SettingsNotifications.addCustomReminder()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Ajouter un délai personnalisé
              </button>
            </div>

            <!-- Card 3: Heures Silencieuses -->
            <div class="notif-card-premium">
              <div class="card-glow"></div>
              <div class="card-header-simple">
                <div class="icon-bg gradient-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                </div>
                <div>
                  <h3>Mode Silencieux</h3>
                  <p class="card-desc">Aucune notification pendant votre sommeil</p>
                </div>
              </div>
              <div class="time-selector">
                <div class="time-block">
                  <label>De</label>
                  <input type="time" id="quiet-start" value="${prefs.quiet_hours_start || '22:00'}" class="time-input-ultra">
                </div>
                <div class="time-arrow">→</div>
                <div class="time-block">
                  <label>À</label>
                  <input type="time" id="quiet-end" value="${prefs.quiet_hours_end || '08:00'}" class="time-input-ultra">
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Actions -->
          <div class="notif-actions-ultra">
            <button class="btn-test" onclick="SettingsNotifications.testNotification()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Tester
            </button>
            <button class="btn-save-ultra" onclick="SettingsNotifications.save()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              Enregistrer les paramètres
            </button>
          </div>
        </div>
      `;

      attachEvents();
    } catch (error) {
      console.error('Render settings notifications error:', error);
      container.innerHTML = '<div class="error-state">Erreur lors du chargement</div>';
    }
  }

  function renderReminderChips() {
    const reminders = prefs?.default_reminder_minutes || [15, 60, 1440];
    const labels = {
      5: '5 min', 10: '10 min', 15: '15 min', 30: '30 min',
      60: '1 heure', 120: '2 heures', 1440: '1 jour',
      2880: '2 jours', 10080: '1 semaine'
    };

    return reminders.map(min => `
      <div class="reminder-chip-ultra" data-minutes="${min}">
        <span class="chip-label">${labels[min] || `${min} min`}</span>
        <button class="chip-close" onclick="SettingsNotifications.removeReminder(${min})" title="Retirer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `).join('');
  }

  function attachEvents() {
    const pushToggle = document.getElementById('push-toggle');
    if (pushToggle) {
      pushToggle.addEventListener('change', async (e) => {
        const wasChecked = e.target.checked;

        try {
          if (wasChecked) {
            const sub = await WebPushUI.subscribe();
            if (!sub) {
              e.target.checked = false;
              Toast?.error('Permissions refusées');
            } else {
              // SUCCESS: rerender pour mettre à jour le statut
              isSubscribed = true;
              const container = document.getElementById('settings-notifications-premium-container');
              if (container) await render(container);
              Toast?.success('✅ Notifications activées !');
            }
          } else {
            await WebPushUI.unsubscribe();
            isSubscribed = false;
            const container = document.getElementById('settings-notifications-premium-container');
            if (container) await render(container);
            Toast?.info('Notifications désactivées');
          }
        } catch (error) {
          console.error('Toggle error:', error);
          e.target.checked = !wasChecked;
          Toast?.error('Erreur lors de la modification');
        }
      });
    }
  }

  async function save() {
    try {
      const reminders = Array.from(document.querySelectorAll('.reminder-chip-ultra')).map(el => parseInt(el.dataset.minutes));
      const quietStart = document.getElementById('quiet-start')?.value;
      const quietEnd = document.getElementById('quiet-end')?.value;

      await Api.put('/notifications/preferences', {
        default_reminder_minutes: reminders,
        quiet_hours_start: quietStart,
        quiet_hours_end: quietEnd
      });

      Toast?.success('✅ Paramètres enregistrés');
    } catch (error) {
      console.error('Save preferences error:', error);
      Toast?.error('Erreur lors de l\'enregistrement');
    }
  }

  async function testNotification() {
    try {
      if (!isSubscribed) {
        Toast?.warning('Activez d\'abord les notifications push !');
        return;
      }
      await WebPushUI.testNotification();
      Toast?.info('📨 Notification de test envoyée');
    } catch (error) {
      Toast?.error('Erreur: ' + error.message);
    }
  }

  function removeReminder(minutes) {
    prefs.default_reminder_minutes = prefs.default_reminder_minutes.filter(m => m !== minutes);
    const chip = document.querySelector(`.reminder-chip-ultra[data-minutes="${minutes}"]`);
    if (chip) {
      chip.style.animation = 'chipRemove 0.3s ease forwards';
      setTimeout(() => chip.remove(), 300);
    }
  }

  function addCustomReminder() {
    const minutes = prompt('Nombre de minutes avant l\'événement calendrier :\n\nExemples:\n• 5 = 5 minutes avant\n• 30 = 30 minutes avant\n• 120 = 2 heures avant\n• 1440 = 1 jour avant');
    if (!minutes || isNaN(minutes)) return;

    const min = parseInt(minutes);
    if (min <= 0) {
      Toast?.error('Veuillez entrer un nombre positif');
      return;
    }

    if (prefs.default_reminder_minutes.includes(min)) {
      Toast?.warning('Ce délai existe déjà');
      return;
    }

    prefs.default_reminder_minutes.push(min);
    const grid = document.querySelector('.reminder-showcase');
    if (grid) {
      grid.innerHTML = renderReminderChips();
      Toast?.success(`✅ Rappel "${min} min" ajouté`);
    }
  }

  return { render, save, testNotification, removeReminder, addCustomReminder };
})();

if (typeof window !== 'undefined') window.SettingsNotifications = SettingsNotifications;
