# 🎵 音訊轉文字工具 & 📝 募資文案生成器 & 🔍 文案檢測

一個整合音訊轉文字、募資文案生成和文案檢測功能的 Web 應用程式。

## ✨ 功能特色

### 🎵 音訊轉文字工具
- 支援音訊格式（MP3）
- 拖曳上傳功能
- 自動呼叫 OpenAI Whisper API 進行轉錄
- 即時顯示轉錄結果

### 📝 募資文案生成器
- 完整的專案資訊表單
- 預設值快速開始
- 自動呼叫 AI 生成募資文案
- 支援多種產品類型和文案風格

### 🔍 文案檢測功能
- 敏感詞檢測
- 法規合規檢測
- 內容品質分析
- 詳細回饋建議

## 🚀 快速開始

### 環境需求
- Node.js 20+ 
- npm
- OpenAI API Key

### 安裝步驟

1. **下載專案**
   ```bash
   git clone <repository-url>
   cd crowdfunding-copy
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **環境設定**
   ```bash
   cp .env.example .env
   ```
   
   在 `.env` 檔案中設定：
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```

4. **啟動服務**
   ```bash
   npm start
   ```

5. **開啟瀏覽器**
  `http://localhost:3000`

## 📋 使用說明

### 音訊轉文字
1. 點擊「選擇音訊檔案」或直接拖拽音訊檔案到上傳區域
2. 系統會自動開始轉錄
3. 等待轉錄完成，查看結果

### 募資文案生成
1. 填寫專案資訊（可使用預設值）
2. 點擊「🚀 生成募資文案」
3. 等待 AI 生成完成
4. 可複製文案或重新生成

### 文案檢測
1. 先生成募資文案
2. 點擊「🔍 檢測文案」
3. 查看檢測結果和建議
4. 根據建議調整文案

## 🛠️ 技術架構

### 後端
- Node.js + Express
- Multer 檔案上傳處理
- OpenAI API 整合

### API 端點
- `POST /api/transcribe` - 音訊轉文字
- `POST /api/fundraising/generate` - 生成募資文案
- `POST /api/fundraising/check` - 檢測文案

## 📁 專案結構

```
crowdfunding-copy/
├── controllers/
│   └── fundraising.js      # 募資相關控制器
├── services/
│   ├── transcribe.js       # 音訊轉文字服務
│   ├── generateCopy.js     # 文案生成服務
│   └── checker.js          # 文案檢測服務
├── public/
│   └── index.html          # 前端頁面
├── server.js               # 主伺服器檔案
├── package.json            # 專案依賴
└── README.md              # 說明文件
```

## 🔧 開發說明

### 新增功能
1. 在 `services/` 目錄新增服務檔案
2. 在 `controllers/` 目錄新增控制器
3. 在 `server.js` 中註冊路由
4. 更新前端頁面

### 環境變數
- `OPENAI_API_KEY`: OpenAI API 金鑰
- `PORT`: 伺服器端口（預設 3000）

## 📝 注意事項

- 音訊檔案大小限制：25MB
- 需要有效的 OpenAI API Key

## 參考資源
https://hackmd.io/@hexschool/Hyo9Fe9RJe
