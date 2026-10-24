/**
 * Android Notification and Push Alert Helper
 */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser/environment');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function sendAndroidNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    vibrate?: number[];
    data?: unknown;
  }
) {
  if (!('Notification' in window)) return false;

  if (Notification.permission !== 'granted') {
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') return false;
  }

  const defaultOptions = {
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [200, 100, 200, 100, 400],
    requireInteraction: true,
    tag: options?.tag || 'daytrader-signal',
    ...options,
  };

  // Try service worker registration first (preferred on Android for background & closed-app alerts)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, defaultOptions);
        return true;
      }
    } catch (e) {
      console.warn('Service worker notification failed, using desktop fallback:', e);
    }
  }

  // Fallback to standard window Notification
  try {
    new Notification(title, defaultOptions);
    return true;
  } catch (e) {
    console.warn('Standard notification failed:', e);
    return false;
  }
}
