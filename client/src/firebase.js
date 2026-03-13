import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAg3z5mcJPzvHmXtrTYWYqPeFsPt2Gjpak",
  authDomain: "roadvision-ba104.firebaseapp.com",
  projectId: "roadvision-ba104",
  storageBucket: "roadvision-ba104.firebasestorage.app",
  messagingSenderId: "500366728161",
  appId: "1:500366728161:web:1abde322a4d27f9752d0a0",
  measurementId: "G-G9J4ZS5BS4"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const storage = getStorage(app);

export { app, storage, analytics };
