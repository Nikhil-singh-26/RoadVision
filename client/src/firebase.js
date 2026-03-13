import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC60ZGuae4jB-sWFW6jZQbAg_MQzumWoyQ",
  authDomain: "roadvision-76994.firebaseapp.com",
  projectId: "roadvision-76994",
  storageBucket: "roadvision-76994.firebasestorage.app",
  messagingSenderId: "350112374983",
  appId: "1:350112374983:web:0ce3cc58360c055886dee2",
  measurementId: "G-K3JS3GNTX0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const storage = getStorage(app);

export { app, storage, analytics };
