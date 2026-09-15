import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const app = express();
const PORT = 3000;

app.use(express.json());

const leads: any[] = [];

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Enable CORS for external requests or previews
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

function checkIssueRelevance(issue: string): boolean {
  const trimmed = issue.trim();
  if (trimmed.length < 3) return false;

  const normalized = trimmed.toLowerCase();
  const irrelevantPatterns = [
    /^肚子[餓饿]/,
    /^[餓饿]了?$/,
    /^[想好]睡(覺|觉)?$/,
    /^[好超很]累$/,
    /^(早安|午安|晚安|你好|您好|哈囉|hello|hi|hey|嗨)$/,
    /^(測試|test|testing|123|1234|abc)$/,
    /^(吃(飯|麵|飯了嗎|飽沒|什麼)|午餐|早餐|晚餐)$/,
    /^(天氣|好熱|好冷|下雨)$/,
    /^(你是誰|什麼名字|人工智慧|chatgpt)$/
  ];

  for (const pattern of irrelevantPatterns) {
    if (pattern.test(normalized)) {
      return false;
    }
  }

  return true;
}

const IRRELEVANT_GUIDANCE_MESSAGE = (issue: string) => `# ⚠️ 勞資戰略快篩提示

您輸入的內容（「${issue}」）並非企業經營管理、勞動法令或人力資源之相關情境。

**【本快篩專為企業主與主管診斷以下核心領域】：**
1. **工時與出勤**：排班調移、打卡紀錄、加班費計算爭議、下班後通訊軟體交辦
2. **勞動契約與退場**：試用期考核標準、不適任資遣、懲戒解僱、PIP 輔導、合意離職協議
3. **商業資產防禦**：離職挖角、客戶名單帶走、營業秘密外洩、競業禁止條款
4. **薪資結構與福利**：底薪與獎金科目重組、高薪低報避險、二代健保與勞退合規
5. **勞檢與爭議處理**：勞工局勞動檢查應對、勞資爭議調解、職場霸凌與性騷擾防治

👉 **請在輸入框中具體描述您目前面臨的團隊或制度痛點**（例如：「員工試用期表現不佳想請他離開，如何避免違法資遣？」或「業務主管離職跳槽競品並私下挖角團隊」），策略人資總監將為您進行深入的法律防火牆檢視與落地方案。`;

function isQuotaExhaustedError(err: any): boolean {
  if (!err) return false;
  if (err.status === 429 || err.statusCode === 429) return true;
  const msg = String(err?.message || "").toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("resource_exhausted") ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("exhausted")
  );
}

const QUOTA_EXHAUSTED_MESSAGE = `# ⚠️ 今日AI額度已使用完畢...

抱歉，由於目前系統線上諮詢量踴躍，**今日AI額度已使用完畢...**

系統目前暫時無法為您的自訂情境進行即時全新 AI 運算分析。

### 建議您採取以下方案：
1. **體驗固定快選範例**：您可以點選上方「常見情境快速填入」的固定快選按鈕（如：出勤與加班、薪資結構優化、不適任員工退場、業務離職帶走客戶等），立即查看由策略人資總監親自精編的完整法規防火牆與戰略實戰示範報告。
2. **預約策略人資顧問深度諮詢**：若您目前正面臨急迫之勞資爭議、員工檢舉、大量資遣、高額求償或營業秘密外洩，建議直接聯繫頭家神隊友顧問團隊進行一對一深度對談：
   - **顧問專線**：0923-869696 許顧問
   - **官方 LINE 預約**：[https://lin.ee/udQp9wm](https://lin.ee/udQp9wm)
   - **聯絡 Email**：360.aiup@gmail.com`;

// AI Diagnostic endpoint
app.post("/api/diagnose", async (req, res) => {
  try {
    const { industry = "製造業", size = "5-30人", issue = "" } = req.body;

    if (!issue || typeof issue !== "string" || !issue.trim()) {
      return res.status(400).json({ error: "請提供具體的管理情境或疑問。" });
    }

    const trimmedIssue = issue.trim();

    // Check if input is relevant to enterprise labor / HR management
    if (!checkIssueRelevance(trimmedIssue)) {
      return res.json({
        success: true,
        report: IRRELEVANT_GUIDANCE_MESSAGE(trimmedIssue),
      });
    }

    const ai = getAi();
    if (!ai) {
      console.warn("[AI Diagnose] Gemini API key not set in environment.");
      return res.json({
        success: true,
        quotaExceeded: true,
        report: QUOTA_EXHAUSTED_MESSAGE,
      });
    }

    let reportMarkdown = "";
    let hitQuota = false;

    const prompt = `企業經營基本資訊：
- 產業別：${industry}
- 公司規模：${size}
- 實際遭遇的管理痛點與情境：
${trimmedIssue}`;

    const systemInstruction = `你現在是一位擁有 20 年經驗、曾任 Fortune 500 外商企業「策略型人資總監 (Strategic HR Director / HRBP)」及資深勞動法令顧問。
你的對話對象是企業主、創辦人或經營決策階層。你擅長跳脫傳統人資行政思維，將「勞動法規遵循」轉化為企業的「商業競爭力」、「護城河」與「人才密度策略」。

【極其重要的輸入真實性與相關性檢驗】：
如果企業主輸入的內容與「企業管理、勞資關係、人力資源、勞動法令、組織營運」無關（如日常打招呼、生理需求、測試亂碼等），請【絕對嚴禁】強行曲解為勞資違法高風險！此時請直接輸出【⚠️ 勞資戰略快篩提示】，委婉告知非勞資問題並指引可諮詢領域。

【核心回答要求】：
1. **深度個性化分析**：必須完全針對企業主提供的「具體情境與痛點細節」展開思考，嚴禁任何千篇一律的樣板套話！分析時請直接點破此問題背後暴露的組織管理盲點、出勤/制度漏洞與企業主的時間/利潤損耗。
2. **精準法規與財務風險**：根據台灣最新勞動法規（如勞基法、性別平等工作法、營業秘密法、職安法、勞保條例等），精準匹配該情境觸犯的具體法條、可能面臨的勞檢罰鍰額度（請標示新台幣金額範圍）與民刑事責任。
3. **高維度落地方案 (Action Plan)**：提供 3-5 項專屬該情境的戰略解法（如制度設計、變形工時、薪資結構切割、PIP績效改善流程、競業避險等），每項方案必須點出「實務做法」與「帶給企業的商業優勢」。
4. **格式規範**：
第一行必須為：# 企業勞資戰略診斷報告
接著依序呈現：
### 1. 現況剖析與商業打擊
（深入剖析該情境對利潤、營運效能與組織士氣的實質傷害）
### 2. 風險評級
（依據違法裁罰風險與財務衝擊，評定為：中度風險 / 高度風險 / 極高風險）
### 3. 法律防火牆與違規裁罰清單
（以 Markdown 表格呈現，欄位為：法源依據(具體條號) | 潛在違規行為 | 預估財務風險/罰鍰金額(依主管機關最新裁罰標準)）
### 4. 策略總監實戰方案 (Action Plan)
（3-5 項清晰實戰步驟，直擊問題根源）
### 5. 總監策略心法
（給企業主的一句高維度管理忠告）

請全程使用專業繁體中文 (台灣用語習慣)，展現頂尖策略顧問的高度與穿透力。`;

    // Standard Gemini models with progressive degradation (Cascade fallback)
    // High-throughput Lite (highest quota & speed) -> Proven 2.5 Flash -> Low-cost Lite -> Primary balanced
    const candidateModels = [
      "gemini-3.1-flash-lite",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-flash-latest",
      "gemini-3.8-flash",
    ];

    let modelUsed = "";

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 2200,
          },
        });

        if (response.text && response.text.trim()) {
          reportMarkdown = response.text.trim();
          modelUsed = model;
          console.log(`[AI Diagnose] Successfully generated real AI report with model: ${model}`);
          break;
        }
      } catch (modelErr: any) {
        console.warn(`[AI Diagnose] Model ${model} failed (${modelErr?.status || modelErr?.message}), trying next fallback model...`);
        if (isQuotaExhaustedError(modelErr)) {
          hitQuota = true;
        }
      }
    }

    // If quota was exhausted or model failed to generate response
    if (!reportMarkdown) {
      console.log(`[AI Diagnose] Real AI generation unavailable (hitQuota=${hitQuota}), returning quota notification.`);
      return res.json({
        success: true,
        quotaExceeded: true,
        report: QUOTA_EXHAUSTED_MESSAGE,
      });
    }

    return res.json({
      success: true,
      quotaExceeded: false,
      report: reportMarkdown,
      modelUsed,
      isDegraded: modelUsed.includes("lite"),
    });
  } catch (error: any) {
    console.error("Diagnosis error:", error);
    if (isQuotaExhaustedError(error)) {
      return res.json({
        success: true,
        quotaExceeded: true,
        report: QUOTA_EXHAUSTED_MESSAGE,
      });
    }
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: error?.message || "診斷分析發生異常，請稍候重試或聯絡顧問專線。",
    });
  }
});

// Contact form booking endpoint
app.post("/api/contact", async (req, res) => {
  try {
    const { company, name, phone, email, industry, size, issue, aiResult } = req.body;
    if (!company || !name || !phone) {
      return res.status(400).json({ error: "請填寫完整公司名稱、聯絡人姓名與電話。" });
    }

    const newLead = {
      id: "LEAD-" + Date.now(),
      company,
      name,
      phone,
      email,
      industry,
      size,
      issue,
      aiResultPreview: aiResult ? aiResult.slice(0, 200) : "",
      createdAt: new Date().toISOString(),
    };

    leads.push(newLead);

    // Send email dispatch to 360.aiup@gmail.com
    let emailSent = false;
    try {
      const emailPayload = {
        _subject: `【高層預約】${company || "企業客戶"} - 策略診斷請求`,
        _replyto: email || "no-reply@example.com",
        "預約時間": new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }),
        "公司名稱": company,
        "聯絡人姓名與職稱": name,
        "聯絡電話": phone,
        "電子郵件": email || "未提供",
        "所屬產業": industry || "未填寫",
        "公司規模": size || "未填寫",
        "諮詢痛點與疑問": issue || "未填寫",
        "AI策略診斷摘要": aiResult ? String(aiResult).slice(0, 1000) : "無快篩結果",
        _template: "table",
      };

      const mailRes = await fetch("https://formsubmit.co/ajax/360.aiup@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });

      if (mailRes.ok) {
        emailSent = true;
        console.log("Successfully forwarded booking email to 360.aiup@gmail.com");
      } else {
        console.warn("FormSubmit response status:", mailRes.status);
      }
    } catch (mailError: any) {
      console.error("Failed to forward email to 360.aiup@gmail.com:", mailError?.message);
    }

    console.log("【高層預約紀錄】", {
      target: "360.aiup@gmail.com",
      emailSent,
      company,
      name,
      phone,
      email,
      industry,
      size,
      issue,
    });

    return res.json({
      success: true,
      emailSent,
      targetEmail: "360.aiup@gmail.com",
      message: "預約資料已送出！頭家神隊友顧問團隊將在 1 個工作天內主動與您聯繫。",
      leadId: newLead.id,
    });
  } catch (err: any) {
    console.error("Contact error:", err);
    return res.status(500).json({ error: "無法送出預約，請直接撥打諮詢專線。" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
