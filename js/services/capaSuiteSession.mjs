// Isolated modular SDK: isolated app instance for CapaSuite to avoid collision with Groups compat app
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getDatabase, ref, onValue, get } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';

export function createSession() {
    const config = {
        apiKey: 'AIzaSyCBa1EEt-9wK7zHoz6c_ZSrB9ZsbX0qCtM',
        authDomain: 'capasuite.firebaseapp.com',
        databaseURL: 'https://capasuite-default-rtdb.europe-west1.firebasedatabase.app/',
        projectId: 'capasuite',
        appId: '1:1066499289752:web:3b2edef8bdec54c52c56ed'
    };
    let app;
    try {
        const apps = typeof getApps === 'function' ? getApps() : [];
        app = apps.find(a => a && (a.name === 'capasuite' || (a.options && a.options.projectId === 'capasuite')));
        if (!app) {
            app = initializeApp(config, 'capasuite');
        }
    } catch (e) {
        try {
            app = initializeApp(config);
        } catch (err) {
            app = typeof getApp === 'function' ? getApp() : null;
        }
    }
    const auth = getAuth(app);
    const db = getDatabase(app);
    return {
        observeAuth: (next, error) => onAuthStateChanged(auth, next, error),
        observeConnection: next => onValue(ref(db, '.info/connected'), snapshot => next(snapshot.val() === true)),
        signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
        listen: (uid, next, error) => onValue(ref(db, 'users/' + uid), next, error),
        read: uid => get(ref(db, 'users/' + uid))
    };
}
