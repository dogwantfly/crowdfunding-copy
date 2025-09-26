const { generateFundraisingCopy } = require('../services/generateCopy');
const { processCopyCheck } = require('../services/checker');

async function generateFundraisingCopyController(req, res) {
    try {
        const projectData = req.body;

        if (!projectData.project_name) {
            return res.status(400).json({ error: '請提供專案名稱' });
        }

        const processedData = {
            project_name: projectData.project_name,
            target_fund: projectData.target_fund || '未指定',
            start_date: projectData.start_date || '未指定',
            end_date: projectData.end_date || '未指定',
            product_type: projectData.product_type || '未指定',
            brand_background: projectData.brand_background || '未指定',
            core_features: projectData.core_features || '未指定',
            target_audience: projectData.target_audience || '未指定',
            tone_style: projectData.tone_style || '專業友善',
        }

        console.log(`收到募資文案生成請求：${processedData.project_name}`);
        const result = await generateFundraisingCopy(processedData);
        return res.json({ result });
    } catch (error) {
        return res.status(500).json({ error: error.message || '生成募資文案失敗' });
    }
}

async function checkFundraisingCopyController(req, res) {
    try {
        const { copyContent, projectData } = req.body;
    if (!copyContent) {
        return res.status(400).json({ error: '請提供文案內容' });
    }
    if (!projectData || !projectData.project_name) {
        return res.status(400).json({ error: '請提供完整的專案資料' });
    }

    const result = await processCopyCheck({ copyContent, projectData });

    return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message || '檢測文案失敗' });
    }
}
module.exports = {
    generateFundraisingCopyController,
    checkFundraisingCopyController,
}