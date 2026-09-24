/* ============================================================
   請把下面換成「你自己」的 Firebase 專案設定
   到 Firebase Console → 專案設定（齒輪圖示）→ 一般
   → 往下捲到「你的應用程式」→ SDK 設定與程式碼
   把那邊的 firebaseConfig 物件整個貼過來取代下面這個即可
   ============================================================ */
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXjTA8OXP7S7ZikGSMKeURtY5WA0BgJuI",
  authDomain: "trionyx-ai.firebaseapp.com",
  projectId: "trionyx-ai",
  storageBucket: "trionyx-ai.firebasestorage.app",
  messagingSenderId: "663915231308",
  appId: "1:663915231308:web:6c613a81556ebd8f139ce9",
  measurementId: "G-VCMYR0JE0B"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);