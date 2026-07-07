const { setGlobalOptions } = require('firebase-functions/v2');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

// A portfolio inbox never needs to scale — capping instances caps cost.
setGlobalOptions({ maxInstances: 2, region: 'asia-south1' });

/**
 * Push a notification to every registered admin device when a visitor
 * submits the contact form. Device tokens live in `fcmTokens/{token}`,
 * written by the dashboard's "enable notifications" button.
 */
exports.notifyOnNewMessage = onDocumentCreated(
  'messages/{messageId}',
  async (event) => {
    const message = event.data?.data();
    if (!message) return;

    const db = getFirestore();
    const tokensSnap = await db.collection('fcmTokens').get();
    const tokens = tokensSnap.docs.map((d) => d.id);
    if (tokens.length === 0) return;

    const result = await getMessaging().sendEachForMulticast({
      tokens,
      notification: {
        title: 'New portfolio message',
        body: `${message.name}: ${message.subject}`,
      },
      webpush: {
        fcmOptions: {
          link: 'https://connectwithsandeepan.in/admin/messages',
        },
        notification: {
          icon: 'https://connectwithsandeepan.in/icons/icon-192x192.png',
        },
      },
    });

    // Tokens go stale when a browser profile is reset or the PWA is
    // reinstalled — drop the ones FCM rejects so they aren't retried forever.
    const stale = [];
    result.responses.forEach((response, i) => {
      const code = response.error?.code;
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token' ||
        code === 'messaging/invalid-argument'
      ) {
        stale.push(tokens[i]);
      }
    });
    await Promise.all(
      stale.map((token) => db.collection('fcmTokens').doc(token).delete()),
    );
  },
);
