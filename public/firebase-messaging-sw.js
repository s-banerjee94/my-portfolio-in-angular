/**
 * FCM background listener. The Firebase SDK registers this worker (at its own
 * scope, so it coexists with the Angular PWA worker) when the admin enables
 * notifications; it displays pushes that arrive while the site is closed and
 * routes notification clicks to the URL in the message's fcmOptions.link.
 *
 * The config below is the public web-app config — same values every visitor
 * already receives in the app bundle.
 */
importScripts(
  'https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js',
);

firebase.initializeApp({
  apiKey: 'AIzaSyBiJTOR9cYekZG_4p6lqJax2M0TJrRWP8M',
  authDomain: 'my-portfolio-in-angular.firebaseapp.com',
  projectId: 'my-portfolio-in-angular',
  storageBucket: 'my-portfolio-in-angular.firebasestorage.app',
  messagingSenderId: '233134339113',
  appId: '1:233134339113:web:704b7f836beb07826a1838',
});

firebase.messaging();
