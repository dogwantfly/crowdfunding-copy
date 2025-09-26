const Openai = require('openai');
require('dotenv').config();

const openai = new Openai({
    apiKey: process.env.OPENAI_API_KEY,
});
/**
 * 生成募資文案
 * @param {Object} projectData - 專案資料
 * @returns {Promise<string>} - 生成的文案
 */
async function generateFundraisingCopy(projectData) {
    try {
        console.log(`生成募資文案：${projectData.project_name}`);

        const prompt = `
        你是一位文案撰寫專家，以下是專案資訊：
        專案名稱：${projectData.project_name}
        募資目標金額：${projectData.target_fund}
        開始/結束日期：${projectData.start_date} ~ ${projectData.end_date}
        產品類型：${projectData.product_type}
        團隊背景：${projectData.brand_background}
        核心特色：${projectData.core_features}
        目標客群：${projectData.target_audience}
        希望文案風格：${projectData.tone_style}

        請根據以上資訊，創建一個完整的募資頁面文案，包含以下部分：
        1. 引人注目的標題
        2. 簡短有力的專案摘要
        3. 專案背景與故事
        4. 產品/服務特色與優勢[可以有多個區塊，不需要只有一個]
        5. 團隊介紹
        6. 資金用途說明
        7. 回饋方案建議
        8. 時程規劃
        9. 結尾呼籲行動

        使用繁體中文，並根據指定的文案風格撰寫
        `

        const response = await openai.responses.create({
            model: 'gpt-4o',
            instructions: `你是一位募資文案撰寫專家，擅長撰寫吸引人的文案`,
            input: [{ role: 'user', content: prompt }],
            temperature: 0.7
        })

        return response.output_text;

    } catch (error) {
        console.log(`生成募資文案失敗：${error.message}`);
        throw error;
    }
}
module.exports = {
    generateFundraisingCopy,
}