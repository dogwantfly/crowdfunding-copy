const Openai = require('openai');
require('dotenv').config();

const openai = new Openai({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 檢測敏感詞
 * @param {string} content - 要檢測的文案內容
 * @returns {Promise<Object>} - 檢測結果
 */
async function detectSensitiveContent(content) {
    try {
        console.log(`開始檢測敏感詞`);

        const sensitiveWordsList = `毒品,海洛因,大麻,槍械,武器,彈藥,炸彈,爆炸物,賭博,賭場,偽造,人口販賣,
保證致富,永遠有效,無副作用,100%有效,立刻見效,史上最強,絕無僅有,獨一無二,前所未有,終極解決方案,
台獨,港獨,藏獨,納粹,三K黨,伊斯蘭國,ISIS,基地組織,恐怖分子,極端主義,聖戰,
黑鬼,支那,小日本,台巴子,基佬,人妖,娘炮,婊子,智障,殘廢,
色情,A片,淫穢,性交,口交,強姦,兒童色情,血腥,屠殺,虐殺,謀殺,
治癒癌症,包治百病,奇蹟療效,立即見效,無副作用,藥到病除,根治,永不復發,醫生推薦,權威認證,
快速致富,一夜致富,穩賺不賠,高收益,零風險,保證回報,利潤翻倍,一本萬利,傳銷,老鼠會`

        const tools = [{
            type: 'function',
            name: 'sensitive_content_analysis',
            description: '分析文案中的敏感內容並提供結果',
            parameters: {
                type: "object",
                properties: {
                    hasSensitiveContent: {
                        type: "boolean",
                        description: "是否含有敏感內容",
                    },
                    sensitiveWords: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        description: "敏感詞列表",
                    },
                    issues: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                category: {
                                    type: "string",
                                    description: "問題類別，如歧視性語言、政治敏感等",
                                },
                                description: {
                                    type: "string",
                                    description: "問題描述",
                                },
                                suggestions: {
                                    type: "string",
                                    description: "修改建議",
                                }
                            }
                        },
                        description: "敏感內容問題列表",
                    },
                    summary: {
                        type: "string",
                        description: "敏感內容分析摘要",
                    }
                }
            },
            required: [
                "hasSensitiveContent",
                "sensitiveWords",
                "issues",
                "summary",
            ]
        }]

        const response = await openai.responses.create({
            model: 'gpt-4o',
            instructions: `你是一位內容審核專家，負責檢測文案中可能存在的敏感詞或不適當內容。
            請特別檢查以下敏感詞列表中的詞語是否出現在文案中：
            ${sensitiveWordsList}
            
            此外，也請檢察以下類別的敏感內容：
            1. 政治敏感詞
            2. 歧視性語言
            3. 違法或灰色地帶內容
            4. 誇大不實的宣傳
            5. 侵犯智慧財產權的內容
            6. 違反平台規範的內容

            請使用 sensitive_content_analysis 函式回傳分析結果，提供詳細的敏感詞檢測報告。
            `,
            input: [{ role: 'user', content }],
            tools,
            tool_choice: "auto",
            temperature: 0.7
        })
        if (response.output && response.output.length > 0) {
            const functionCall = response.output.find(item => {
                item.type === 'function_call' && item.name === 'sensitive_content_analysis'
            })
            if (functionCall) {
                const result = JSON.parse(functionCall.arguments);
                const analysisText = `
                敏感詞檢測結果：
                是否發現敏感內容：${result.hasSensitiveContent ? '是' : '否'}
                ${result.hasSensitiveContent ? `發現的敏感詞：${result.sensitiveWords.join(', ')}` : '未發現敏感詞'}

                問題詳情：
                ${result.issues.map(item => `${item.category}：${item.description}\n建議：${item.suggestions}`).join('\n\n')}

                總結：${result.summary}
                `
                return {
                    ...result,
                    analysis: analysisText,
                }
            }
        }
        return {
            hasSensitiveContent: false,
            sensitiveWords: [],
            issues: [],
            summary: '無法進行敏感詞檢測',
            analysis: '無法進行敏感詞檢測，請稍後再試',
        }
    } catch (error) {
        console.log(`檢測敏感詞失敗：${error.message}`);
        throw error;
    }
}

/**
 * 進行法規檢測
 * @param {string} content - 要檢測的文案內容
 * @param {Object} projectData - 專案資料
 * @returns {Promise<Object>} - 檢測結果
 */
async function regulatoryCompliance(content, projectData) {
    try {
        console.log(`開始進行法規檢測`);

        const checkList = `
        一、交易／集資類（4 大常見違規重點）
        1. 保證獲利、零風險、穩賺不賠（如「穩賺不賠」「保證本金」）；可能違反《公平交易法》虛偽廣告、金管會廣告辦法、銀行法非法吸金等。
        2. 誇大收益、高額回報（如「短期翻倍」「年化收益率XX%」）；可能違反《公平交易法》虛偽不實、銀行法第29條之1非法吸收資金。
        3. 冒用官方或第三方背書（如「政府立案」「金管會核准」「官方保證」）；可能違反《公平交易法》誤導表示、相關刑法偽造文書規範。
        4. 未揭露風險或限制（只談好處、不提風險，或警語極小字）；可能違反《消費者保護法》重要資訊揭露、《公平交易法》誤導宣傳。

        二、功能性產品（智慧裝置、AI 工具等）
        1. 使用最高級、絕對化詞彙（如「全球唯一」「第一品牌」「無失誤」）；恐違反《公平交易法》第21條誇大不實。
        2. 暗示醫療功效或醫療級（如「治療失眠」「舒緩關節疼痛」「醫生背書」）；恐違反《藥事法》《醫療器材管理法》等。
        3. 虛假專利或官方認證（如「NASA技術」「軍規測試」「FDA核可」）；恐違反《公平交易法》或《專利法》。

        三、營養保健食品（膠原蛋白、益生菌、魚油等）
        1. 宣稱醫療功效（如「治療糖尿病」「預防感冒」「降血壓、抗癌」）；違反《食品安全衛生管理法》第28條（不得標榜療效）。
        2. 誇大瘦身或速效（如「免運動就能瘦」「3天見效」「一週瘦10公斤」）；違反食安法誇大宣傳，亦涉《公平交易法》虛偽不實。
        3. 偽專業背書或不實認證（如「衛福部小綠人認證」「FDA核可」「名醫推薦」）；違反食安法及《公平交易法》虛假廣告。

        四、美容保健產品（瘦身、美白、抗老化等）
        1. 不實速效、永久功效（如「瞬間美白」「一週逆齡」「永不復發」）；違反《化粧品衛生安全管理法》第10條、亦涉《公平交易法》。
        2. 醫藥療效宣稱（如「治療粉刺」「醫療級除皺」「根治痘痘」）；超出化粧品範疇，違反化粧品法及《藥事法》。
        3. 誇大成分作用（如「幹細胞再生技術」「醫美級玻尿酸」）；無科學依據或專利說明則違反《化粧品衛生安全管理法》《公平交易法》。
        `

        const tools = [{
            type: 'function',
            name: 'regulatory_compliance_analysis',
            description: "分析文案是否符合法規並提供結果",
            parameters: {
                type: "object",
                properties: {
                    hasRegulatoryIssues: {
                        type: "boolean",
                        description: "是否發現法規問題"
                    },
                    violations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                category: {
                                    type: "string",
                                    description: "違規類別"
                                },
                                content: {
                                    type: "string",
                                    description: "違規內容"
                                },
                                law: {
                                    type: "string",
                                    description: "相關法規"
                                },
                                suggestions: {
                                    type: "string",
                                    description: "修改建議"
                                }
                            }
                        },
                        description: '法規違規列表'
                    },
                    missingElements: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        description: '缺少的必要元素（如風險揭露、退款政策等）'
                    },
                    summary: {
                        type: "string",
                        description: "法規檢測總結"
                    },
                },
                required: [
                    "hasRegulatoryIssues",
                    "violations",
                    "missingElements",
                    "summary",
                ],
            }
        }]

        const response = await openai.responses.create({
            model: 'gpt-4o',
            instructions: `
            你是一位募資法規專家，負責檢查募資文案是否符合相關法規。
            請特別檢查以下法規清單中提到的違規情況是否出現在文案中：
            ${checkList}

            此外，也請檢察以下方面：
            1. 消費者保護法相關規範
            2. 廣告法規遵循
            3. 募資平台特定規範
            4. 產品安全與責任聲明
            5. 智慧財產權聲明
            6. 退款與交付政策

            請使用 regulatory_compliance_analysis 函式回傳分析結果，提供詳細的法規檢測報告。
            `,
            input: [{
                role: 'user',
                content: `
                專案資料：${JSON.stringify(projectData)}
                \n\n文案內容：${content}
                `
            }],
            tools,
            tool_choice: "auto",
            temperature: 0.3
        })

        if (response.output && response.output.length > 0) {
            const functionCall = response.output.find(item => item.type === 'function_call' && item.name === 'regulatory_compliance_analysis')
            if (functionCall) {
                const result = JSON.parse(functionCall.arguments);
                const analysisText = `
                法規檢測結果：
                是否發現法規問題：${result.hasRegulatoryIssues ? '違規項目' : ''}
                ${result.violations.map(item => `${item.category}：${item.content}\n建議：${item.suggestions}`).join('\n\n')}
                ${result.missingElements.length > 0 ? "缺少的必要元素：" : ''}
                ${result.missingElements.map((e) => `- ${e}`).join("\n")}

                總結：${result.summary}
                `;

                return {
                    ...result,
                    analysis: analysisText,
                }
            }

            return {
                hasRegulatoryIssues: false,
                violations: [],
                missingElements: [],
                summary: '無法進行法規檢測',
                analysis: '無法進行法規檢測，請稍後再試',
            }
        }
    } catch (error) {
        console.log(`檢測法規失敗：${error.message}`);
        throw error;
    }
}

/**
 * 生成總結回饋
 * @param {Object} results - 各階段結果
 * @returns {Promise<string>} - 總結回饋
 */
async function generateFeedback(results) {
    try {
        console.log(`生成總結回饋`);

        const response = await openai.responses.create({
            model: 'gpt-4o',
            instructions: `你是一位募資顧問專家，負責提供專業的募資文案回饋。
                根據文案生成、敏感詞檢測和法規檢測的結果，提供全面的總結回饋。
                包含以下方面：
                1. 文案整體評價
                2. 敏感內容處理建議
                3. 法規合規性建議
                4. 改進方向
                5. 募資成功要點提示

                使用繁體中文，提供專業、實用且具體的建議。`,
            input: [{
                role: 'user',
                content: JSON.stringify(results)
            }],
            temperature: 0.5
        })

        return response.output_text;

    } catch (error) {
        console.log(`生成總結回饋失敗：${error.message}`);
        throw error;
    }
}

/**
 * 處理文案檢測流程
 * @param {Object} data - 包含文案內容和專案資料
 * @returns {Promise<Object>} - 檢測結果
 */
async function processCopyCheck(data) {
    try {
        const { copyContent, projectData } = data;
        console.log("第一階段：敏感詞檢測")

        const sensitiveCheckResult = await detectSensitiveContent(copyContent);

        console.log("第二階段：法規檢測")
        const regulatoryCheckResult = await regulatoryCompliance(copyContent, projectData);

        const results = {
            projectData,
            copyContent,
            sensitiveCheckResult,
            regulatoryCheckResult,
        }
        const feedback = await generateFeedback(results);
        return {
            sensitiveCheckResult,
            regulatoryCheckResult,
            feedback,
        }
    } catch (error) {
        console.log(`檢測文案失敗：${error.message}`);
        throw error;
    }
}

module.exports = {
    processCopyCheck,
}