// Peticiones accesses private data through authenticated functions, not client Firestore.
(function () {
    'use strict';
    if (typeof firebase !== 'undefined' && window.firebaseConfig && !firebase.apps.length) {
        firebase.initializeApp(window.firebaseConfig);
    }
})();
