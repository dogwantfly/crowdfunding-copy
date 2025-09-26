const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();
async function transcribeAudio(audioBuffer, mimeType, originalFilename) {
    try {
        const extension = originalFilename.split('.').pop() || 'mp3';

        const formData = new FormData();
        formData.append("model", "whisper-1");
        formData.append("language", "zh");
        formData.append("file", audioBuffer, {
            filename: `audio.${extension}`,
            contentType: mimeType,
        })

        const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData , {
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                ...formData.getHeaders(),
            }
        })

        return {
            success: true,
            text: response.data.text,
        }

    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message,
        }
    }
}

module.exports = {
    transcribeAudio,
}