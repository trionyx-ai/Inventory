# 倉記 Crate — 庫存管理系統

純前端網頁(HTML/CSS/JS,免 build 工具),資料儲存在 Firebase(免費額度足夠小團隊使用)。
功能:多人帳號登入/註冊、庫存新增編輯刪除(含存放位置)、依客戶產生「點交表」並列印/存 PDF、點交歷史紀錄。

---

## 第一步:建立 Firebase 專案(約 5 分鐘)

1. 前往 https://console.firebase.google.com/ ,用 Google 帳號登入
2. 點「新增專案」,輸入專案名稱(例如 `my-crate`),一路下一步建立完成
3. 左側選單進入 **Build → Authentication** → 「開始使用」→ 在「登入方式」選 **電子郵件/密碼**,啟用它
4. 左側選單進入 **Build → Firestore Database** → 「建立資料庫」→ 選「以正式版模式啟動」→ 選一個離你近的地區(例如 `asia-east1`)→ 完成
5. 建立完成後,點 Firestore 左上「規則 Rules」分頁,把內容整個換成:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

   這代表「只有登入過的人可以讀寫資料」,團隊成員都能看到同一份庫存。按「發布」。

6. 回到專案總覽頁(左上齒輪 → 專案設定),往下捲到「你的應用程式」,點 `</>` (網頁) 圖示,
   輸入應用程式暱稱 → 註冊。會出現一段 `firebaseConfig = {...}` 的設定,**先複製起來**,等一下要用。

---

## 第二步:填入你的 Firebase 設定

打開 `assets/firebase-config.js`,把裡面的 `firebaseConfig` 物件整個換成剛剛複製的內容。

---

## 第三步:本機測試(選用)

因為瀏覽器的安全限制,直接用 `file://` 開啟 `index.html` 可能無法正常運作,
建議用簡單的本機伺服器測試,例如(需要 Python):

```
cd inventory-app
python3 -m http.server 8000
```

然後瀏覽器開 `http://localhost:8000`。第一次使用時先按「建立帳號」註冊你自己的帳號。

---

## 第四步:放到 GitHub Pages

1. 在 GitHub 建立一個新的 repository(例如 `crate-inventory`),設為 Public
2. 把這個資料夾裡所有檔案 push 上去:

   ```
   cd inventory-app
   git init
   git add .
   git commit -m "初始化庫存管理系統"
   git branch -M main
   git remote add origin https://github.com/你的帳號/crate-inventory.git
   git push -u origin main
   ```

3. 到 GitHub repo 頁面 → **Settings → Pages** → Source 選 `main` branch、資料夾選 `/ (root)` → Save
4. 等 1-2 分鐘,頁面會出現網址,格式類似:
   `https://你的帳號.github.io/crate-inventory/`

5. **重要**:回到 Firebase Console → Authentication → Settings → Authorized domains,
   按「新增網域」,把 `你的帳號.github.io` 加進去,否則登入會被擋掉。

完成後,把這個網址分享給團隊成員,大家各自用「建立帳號」註冊即可,資料會同步共用。

---

## 檔案結構

```
inventory-app/
├── index.html          登入 / 註冊頁
├── dashboard.html       主控台(庫存管理 / 點交表 / 歷史紀錄)
├── assets/
│   ├── style.css         版面樣式
│   ├── firebase-config.js  ← 你要編輯這個檔案,填入自己的 Firebase 設定
│   ├── auth.js            登入註冊邏輯
│   ├── app.js              主控台共用邏輯(登入驗證、分頁切換、登出)
│   ├── inventory.js        庫存 CRUD
│   └── handover.js         點交表建立、列印、歷史紀錄
└── README.md
```

## 之後想擴充的方向

- 用 CSS 的 `@media print` 已經做好「只印點交表、不印其他畫面」,按產生後會自動叫出瀏覽器的列印視窗,選「另存為 PDF」就能存成 PDF 檔
- 若團隊成員多、想區分「管理員」與「一般人員」權限,可以在 Firestore 規則裡依 `request.auth.token` 做更細的權限控管
- 若想要條碼/QR code 掃描找位置,可以之後加入 `html5-qrcode` 之類的免費函式庫
