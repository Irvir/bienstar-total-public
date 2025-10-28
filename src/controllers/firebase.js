// controllers/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// 🔧 Configuración de Firebase (usando variables de entorno de Vite)
// Si las variables de entorno no están presentes (por ejemplo en pruebas rápidas),
// usamos como fallback la configuración que te proporcionó Firebase.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA0B_xX2Ygq9WJlbAkOEh43a8hM97MEUhA",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bienstartotal-8bf5e-c8a67.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bienstartotal-8bf5e-c8a67",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bienstartotal-8bf5e-c8a67.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "773361188159",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:773361188159:web:bdbfdf1b30d76f458ae78a",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-CR2LV8TH22",
};

// 🚀 Inicializar Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Autenticación
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 📊 Analytics (solo si el navegador lo soporta)
let analytics = null;
isSupported().then((yes) => {
    if (yes) analytics = getAnalytics(app);
});

export { analytics };
