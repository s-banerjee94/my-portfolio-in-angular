import { inject, Injectable, signal } from '@angular/core';
import { deleteDoc, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { ToastService } from './toast.service';

/**
 * Public VAPID key ("Web Push certificate") from the Firebase console —
 * Project settings → Cloud Messaging → Web configuration. Public by design;
 * it only lets FCM verify pushes were signed by this project.
 */
const VAPID_KEY = 'BI1vXf9fHKi7eUdJcbKb37cPQipQW6nShCYZxQ9fG8VCxoDOxxzIlvRCoa2Xo-ZMGG-hVFK_J34H2UA3cTBYi-Q';

/**
 * Opt-in push notifications for the admin: one click on the dashboard's bell
 * registers the current device's FCM token in `fcmTokens/{token}`, and the
 * notifyOnNewMessage Cloud Function pushes to every registered token when a
 * contact message arrives. Background delivery is handled by
 * public/firebase-messaging-sw.js; foreground pushes surface as toasts here.
 */
@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly messaging = inject(Messaging);
  private readonly firestore = inject(Firestore);
  private readonly toast = inject(ToastService);

  readonly permission = signal<NotificationPermission | 'unsupported'>(
    PushNotificationService.supported() ? Notification.permission : 'unsupported',
  );

  constructor() {
    if (PushNotificationService.supported()) {
      // While the dashboard is open, FCM suppresses the native notification
      // and delivers here instead — show it as a toast.
      onMessage(this.messaging, (payload) => {
        const notification = payload.notification;
        if (notification) {
          this.toast.info(notification.body ?? '', notification.title ?? 'Notification');
        }
      });
    }
  }

  static supported(): boolean {
    return (
      typeof Notification !== 'undefined' && 'serviceWorker' in navigator
    );
  }

  /** Ask permission and register this device for new-message pushes. */
  async enable(): Promise<void> {
    if (!PushNotificationService.supported()) {
      this.toast.warn('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    this.permission.set(permission);
    if (permission !== 'granted') {
      this.toast.warn(
        'Permission was not granted — enable notifications for this site in the browser settings',
      );
      return;
    }

    try {
      const token = await getToken(this.messaging, { vapidKey: VAPID_KEY });
      await setDoc(doc(this.firestore, `fcmTokens/${token}`), {
        createdAt: Date.now(),
        userAgent: navigator.userAgent,
      });
      this.toast.success('This device now gets notified about new messages');
    } catch {
      this.toast.error('Could not register this device for notifications');
    }
  }

  /** Unregister this device. Must run while still signed in —
   *  the fcmTokens rules reject writes from signed-out users. */
  async disable(): Promise<void> {
    if (
      !PushNotificationService.supported() ||
      Notification.permission !== 'granted'
    ) {
      return; // device was never registered — nothing to clean up
    }
    try {
      const token = await getToken(this.messaging, { vapidKey: VAPID_KEY });
      await deleteDoc(doc(this.firestore, `fcmTokens/${token}`));
    } catch {
      // Best-effort: a failed cleanup must never block the logout itself.
    }
  }
}
