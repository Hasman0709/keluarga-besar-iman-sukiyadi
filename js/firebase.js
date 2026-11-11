import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCUSzh1u9hrYfsywgi_TSznukNa7wq_Zas",
  authDomain: "keluarga-besar-iman-suki-91989.firebaseapp.com",
  projectId: "keluarga-besar-iman-suki-91989",
  storageBucket: "keluarga-besar-iman-suki-91989.firebasestorage.app",
  messagingSenderId: "303917640364",
  appId: "1:303917640364:web:00815e9533daade02b0d09"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
