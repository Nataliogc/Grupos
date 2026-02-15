// Configuración centralizada de Firebase
// IMPORTANTE: Si estás viendo este archivo en un repositorio público,
// asegúrate de restringir esta API Key en la Google Cloud Console
// para que solo acepte peticiones desde tus dominios autorizados.
// (https://console.cloud.google.com/apis/credentials)

window.firebaseConfig = {
    apiKey: "AIzaSyAn_A9mfH3TCgC-yWGPyRN1sAHhsWWEKis",
    authDomain: "gest-grupos-hotel.firebaseapp.com",
    projectId: "gest-grupos-hotel",
    storageBucket: "gest-grupos-hotel.firebasestorage.app",
    messagingSenderId: "323336953379",
    appId: "1:323336953379:web:cf6288c624520859001b96"
};

// Exponer la API Key individualmente si es necesaria para otras llamadas (ej. Gemini)
window.GOOGLE_API_KEY = window.firebaseConfig.apiKey;
