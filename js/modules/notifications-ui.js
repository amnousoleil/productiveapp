/**
 * Web Push UI - Web Push Manager
 * @description Gestion permissions et abonnements push (ne pas confondre avec NotificationsUI pour in-app notifs)
 */
const WebPushUI = (function() {
  'use strict';

  const VAPID_PUBLIC_KEY = 'BHp4veU7EMv3jyMj5eKw6MSQdrjgN2WLieNehEIM97NV4Esg1sVS0EqzxML0eM817bUOtOOgyj9i9WTZGcEdl6I';

  async function requestPermission() {
    if (!('Notification' in window)) {
      Toast?.error('Votre navigateur ne supporte pas les notifications');
      return false;
    }

    if (Notification.permission === 'granted') return true;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async function subscribe() {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return null;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Send to backend
      await Api.post('/notifications/subscribe', { subscription: subscription.toJSON() });
      
      Toast?.success('🔔 Notifications activées !');
      return subscription;
    } catch (error) {
      console.error('Subscribe error:', error);
      Toast?.error('Erreur lors de l\'activation');
      return null;
    }
  }

  async function unsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      await Api.post('/notifications/unsubscribe');
      Toast?.success('Notifications désactivées');
    } catch (error) {
      console.error('Unsubscribe error:', error);
      Toast?.error('Erreur lors de la désactivation');
    }
  }

  async function getSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Get subscription error:', error);
      return null;
    }
  }

  async function testNotification() {
    try {
      await Api.post('/notifications/test');
      Toast?.info('Notification de test envoyée');
    } catch (error) {
      console.error('Test notification error:', error);
      Toast?.error(error.message || 'Erreur');
    }
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return {
    requestPermission,
    subscribe,
    unsubscribe,
    getSubscription,
    testNotification
  };
})();

if (typeof window !== 'undefined') window.WebPushUI = WebPushUI;
