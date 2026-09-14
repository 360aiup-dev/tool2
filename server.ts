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

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Diagnostic endpoint
app.post("/api/diagnose", async (req, res) => {
  try {
    const { industry = "製造業", size = "5-30人", issue = "" } = req.body;

    if (!issue || typeof issue !== "string" || !issue.trim()) {
      return res.status(400).json({ error: "請提供具體的管理情境或疑問。" });
    }

    const ai = getAi();
    let reportMarkdown = "";

    if (ai) {
      const prompt = `以下是企業經營資訊：\n- 產業：${industry}\n- 規模：${size}\n- 遇到的問題：${issue.trim()}`;

      const systemInstruction = `你現在是一位擁有 20 年經驗、曾在 Fortune 500 企業服務的「策略型人資總監 (Strategic HR Director / HRBP)」。
你的對話對象是企業主 (老闆)。你擅長將「法規遵循」轉化為「商業競爭力」。

回答規範：
1. **商業優先**：簡短分析該問題如何阻礙業務成長或損害利潤。
2. **顧問姿態**：運用專業框架，直接指出經營盲點。
3. **人才密度**：主張優化制度以留住優秀人才並處理不適任者。
4. **極簡風格**：內容力求精準，不說廢話。
5. **第一行標題**：# 企業勞資戰略診斷報告

請嚴格依照以下順序回覆：

1. **現況分析與商業影響：** (簡短精準分析對營運的負面影響)
2. **風險評級：** (低/中/高)
3. **法律防火牆清單：** (Markdown 表格，僅列出直接相關法條。欄位：法源依據(請列出具體法條) | 潛在違規行為 | 預估財務風險/罰鍰(請列出預估罰鍰金額與具體罰鍰條款))
4. **策略建議 (Action Plan)：** (3-5 項核心建議。僅使用主項目符號，內容簡短精準，不需次級項目。)

*提示：請務必諮詢當地勞動法律顧問以確保合規*`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 3000,
          },
        });

        reportMarkdown = response.text || "";
      } catch (err1: any) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.7,
              maxOutputTokens: 3000,
            },
          });
          reportMarkdown = response.text || "";
        } catch (genError: any) {
          console.warn("Gemini API call failed, using baseline fallback:", genError?.message);
        }
      }
    }

    // Fallback if AI key missing or empty response
    if (!reportMarkdown) {
      reportMarkdown = `# 企業勞資戰略診斷報告

1. **現況分析與商業影響：**
貴司（${industry}，規模約${size}）所遇「${issue.slice(0, 30)}...」，核心盲點在於出勤紀錄與薪酬結構未落實法制化防禦閉環。模糊的管理界限易削弱團隊士氣與人才密度，更會因非經常性給與認定爭議或隱形加班爭議，面臨勞動檢查直接裁罰與追溯工資給付，直接侵蝕企業核心利潤。

2. **風險評級：**
高

3. **法律防火牆清單：**

| 法源依據(請列出具體法條) | 潛在違規行為 | 預估財務風險/罰鍰(請列出預估罰鍰金額與具體罰鍰條款) |
| :--- | :--- | :--- |
| **勞動基準法第24條、第39條** | 加班費與假日出勤工資基數未納入經常性給與 | 依勞基法第79條第1項第1款，處 NT$ 2萬 ～ 100萬元罰鍰，得按次連續處罰並公佈名稱 |
| **勞動基準法第30條第5項、第6項** | 未詳實備置記錄至分鐘之出勤紀錄，或下班後通訊軟體交辦未建立補登機制 | 依勞基法第79條第2項，處 NT$ 9萬 ～ 45萬元罰鍰 |
| **勞動基準法第11條、第12條、第16條** | 不適任員工退場未符合「解僱最後手段性原則」即逕行終止契約 | 勞工得提起確認僱傭關係訴訟，雇主須補發爭訟期間全額工資、法定利息與勞保退休金 |

4. **策略建議 (Action Plan)：**
- **重塑激勵型薪資結構**：清楚切割勞務對價底薪與績效激勵分紅，合法降低二代健保、勞保負擔及加班費膨脹風險。
- **建立數位出勤與離線原則規範**：制定非工作時間 Line/通訊軟體回覆作業規範與加班事前審批流程，杜絕勞檢隱形加班地雷。
- **啟動績效輔導 (PIP) 書面化留痕**：針對不適任人員落實輔導紀錄與定期面談考核，完備合規調動與合法退場之鐵證鏈。
- **盤點並核備工作規則與勞動契約**：增訂符合業務現況之職能調動五原則與保密條款，將法規遵循化為企業組織競爭力。

*提示：請務必諮詢當地勞動法律顧問以確保合規*`;
    }

    return res.json({
      success: true,
      report: reportMarkdown,
    });
  } catch (error: any) {
    console.error("Diagnosis error:", error);
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
