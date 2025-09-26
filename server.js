const express = require('express');
const multer = require('multer');
require('dotenv').config();
const { transcribeAudio } = require('./services/transcribe');
const { generateFundraisingCopyController, checkFundraisingCopyController } = require('./controllers/fundraising');


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 25*1024*1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('僅能上傳音訊檔案'));
        }
    }
})



app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: '請上傳音訊檔案' });
    }
    console.log(`收到音訊檔案: ${req.file.originalname}, 大小: ${req.file.size} bytes`);

    const result = await transcribeAudio(req.file.buffer, req.file.mimetype, req.file.originalname);

    if (result.success) {
        return res.json({ text: result.text });
    } else {
        return res.status(500).json({ error: result.error });
    }
})

app.post('/api/fundraising/generate', generateFundraisingCopyController);

app.post('/api/fundraising/check', checkFundraisingCopyController)

app.listen(port, () => {
    console.log(`伺服器正在 port ${port} 上運行`);
})