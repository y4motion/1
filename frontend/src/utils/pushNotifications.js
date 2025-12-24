const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const checkPushSupport = () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return false;
  }

  if (!('PushManager' in window)) {
    console.log('Push API not supported');
    return false;
  }

  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  return true;
};

export const requestNotificationPermission = async () => {
  if (!checkPushSupport()) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
};

export const subscribeToPush = async () => {
  try {
    // Request permission first
    const permission = await requestNotificationPermission();
    
    if (permission !== 'granted') {
      throw new Error(`Permission ${permission}`);
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Get VAPID public key from env
    const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
    
    if (!vapidPublicKey) {
      throw new Error('VAPID public key not configured');
    }

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    console.log('Push subscription:', subscription);

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    throw error;
  }
};

export const unsubscribeFromPush = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('Unsubscribed from push');
      return subscription.endpoint;
    }

    return null;
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
    throw error;
  }
};

export const getCurrentSubscription = async () => {
  try {
    if (!checkPushSupport()) return null;
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('Failed to get subscription:', error);
    return null;
  }
};

export const showLocalNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/logo192.png',
      badge: '/badge.png',
      ...options
    });
  }
};
