/* ============================================================
   請把下面換成「你自己」的 Firebase 專案設定
   到 Firebase Console → 專案設定（齒輪圖示）→ 一般
   → 往下捲到「你的應用程式」→ SDK 設定與程式碼
   把那邊的 firebaseConfig 物件整個貼過來取代下面這個即可
   ============================================================ */
/* ============================================================
   Firebase 專案設定 — trionyx-ai
   ============================================================ */
/* ============================================================
   Firebase 專案設定 — trionyx-ai
   （這裡只用 Firestore 存資料，不用 Firebase Authentication，
   所以不需要在 Firebase Console 另外開啟「登入方式」）
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyAXjTA8OXP7S7ZikGSMKeURtY5WA0BgJuI",
  authDomain: "trionyx-ai.firebaseapp.com",
  projectId: "trionyx-ai",
  storageBucket: "trionyx-ai.firebasestorage.app",
  messagingSenderId: "663915231308",
  appId: "1:663915231308:web:6c613a81556ebd8f139ce9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
