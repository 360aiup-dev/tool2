import React, { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import {
  Sparkles,
  Zap,
  Printer,
  Bot,
  AlertTriangle,
  Check,
  Cpu,
  RefreshCw,
  X,
  ExternalLink,
} from "lucide-react";
import type { IndustryType, CompanySizeType } from "../types";

export const DEFAULT_ISSUE = "";

export const DEFAULT_REPORT_MARKDOWN = "";

export const AiRiskScreening: React.FC = () => {
  const [industry, setIndustry] = useState<IndustryType>("製造業");
  const [size, setSize] = useState<CompanySizeType>("5-30人");
  const [issue, setIssue] = useState<string>(DEFAULT_ISSUE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportMarkdown, setReportMarkdown] = useState<string>("");
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [reportType, setReportType] = useState<
    "real_ai" | "quota" | "guidance"
  >("real_ai");
  const [modelEngineInfo, setModelEngineInfo] = useState<{ model: string; isDegraded: boolean } | null>(null);

  const resultContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let targetIndustry: IndustryType = "製造業";
    let targetSize: CompanySizeType = "5-30人";

    try {
      const saved = localStorage.getItem("last_diagnosis_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.industry) targetIndustry = parsed.industry;
        if (parsed.size) targetSize = parsed.size;
        // Purge any stored issue or previous demo report so entering is strictly clean
        let hasModified = false;
        if (parsed.issue) {
          delete parsed.issue;
          hasModified = true;
        }
        if (parsed.aiResult) {
          delete parsed.aiResult;
          hasModified = true;
        }
        if (hasModified) {
          try {
            localStorage.setItem("last_diagnosis_data", JSON.stringify(parsed));
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (e) {
      // ignore
    }

    setIndustry(targetIndustry);
    setSize(targetSize);
    setIssue(""); // Always keep input area empty with no pre-filled text
    setReportMarkdown("");
    setRenderedHtml("");
  }, []);

  // Dynamically resolve backend API endpoints across GitHub Pages and Cloud Run
  const getCandidateApiUrls = (path: string): string[] => {
    const urls: string[] = [];
    const metaEnv = (import.meta as any).env || {};
    const custom = metaEnv.VITE_API_URL || metaEnv.VITE_BACKEND_URL;
    if (custom && typeof custom === "string" && custom.startsWith("http")) {
      urls.push(`${custom.replace(/\/+$/, "")}${path}`);
    }

    const isGitHubPages =
      typeof window !== "undefined" &&
      (window.location.hostname.includes("github.io") ||
        window.location.hostname.includes("localhost") === false &&
        !window.location.hostname.includes("run.app"));

    if (isGitHubPages) {
      // Prioritize the live active production Cloud Run backend
      urls.push(`https://ais-pre-rdsmd6k3mwl3urmcbod3im-581991009233.asia-east1.run.app${path}`);
      urls.push(`https://ais-dev-rdsmd6k3mwl3urmcbod3im-581991009233.asia-east1.run.app${path}`);
    }

    // Relative endpoint (default for local dev and direct Cloud Run)
    urls.push(path);

    if (!isGitHubPages) {
      urls.push(`https://ais-pre-rdsmd6k3mwl3urmcbod3im-581991009233.asia-east1.run.app${path}`);
    }

    return Array.from(new Set(urls));
  };

  const QUOTA_EXHAUSTED_CLIENT_MESSAGE = `# ⚠️ 今日 AI 運算額度已用完

抱歉，目前系統 AI 算力額度已達上限，暫無法為您進行即時診斷分析與回答問題。

### 請洽網站管理者：
若您需要進行企業勞資風險診斷或有即時法務諮詢需求，請直接洽詢網站管理者：

- **網站管理者信箱**：360.aiup@gmail.com
- **諮詢專線**：0923-869696 Sandy顧問
- **官方 LINE 諮詢**：[點此加入 LINE 諮詢](https://lin.ee/udQp9wm)

---

💡 **您亦可直接於本頁面下方「預約深度諮詢」填寫表單，管理者與顧問團隊收到後將盡快主動與您聯絡！**`;

  const isIrrelevantIssue = (iss: string): boolean => {
    const trimmed = iss.trim();
    if (trimmed.length < 3) return true;
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
    return irrelevantPatterns.some((p) => p.test(normalized));
  };

  const IRRELEVANT_GUIDANCE_MESSAGE = (iss: string) => `# ⚠️ 勞資戰略快篩提示

您輸入的內容（「${iss}」）並非企業經營管理、勞動法令或人力資源之相關情境。

**【本快篩專為企業主與主管診斷以下核心領域】：**
1. **工時與出勤**：排班調移、打卡紀錄、加班費計算爭議、下班後通訊軟體交辦
2. **勞動契約與退場**：試用期考核標準、不適任資遣、懲戒解僱、PIP 輔導、合意離職協議
3. **商業資產防禦**：離職挖角、客戶名單帶走、營業秘密外洩、競業禁止條款
4. **薪資結構與福利**：底薪與獎金科目重組、高薪低報避險、二代健保與勞退合規
5. **勞檢與爭議處理**：勞工局勞動檢查應對、勞資爭議調解、職場霸凌與性騷擾防治

👉 **請在上方輸入框具體描述您目前面臨的團隊或制度痛點**（例如：「員工試用期表現不佳想請他離開，如何避免違法資遣？」或「業務主管離職跳槽競品並私下挖角團隊」），策略人資總監將為您進行深入的法律防火牆檢視與落地方案。`;

  const handleRunDiagnosis = async () => {
    if (!issue.trim()) {
      setErrorMessage("請輸入您的管理痛點或疑問。");
      return;
    }

    setErrorMessage("");

    const trimmedIssue = issue.trim();

    // 1. Check if input is non-HR irrelevant chit-chat (e.g. "肚子餓")
    if (isIrrelevantIssue(trimmedIssue)) {
      setIsLoading(true);
      setReportMarkdown("");
      setRenderedHtml("");
      const guidance = IRRELEVANT_GUIDANCE_MESSAGE(trimmedIssue);
      setReportType("guidance");
      setReportMarkdown(guidance);
      const parsed = await marked.parse(guidance);
      setRenderedHtml(parsed);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setReportMarkdown("");
    setRenderedHtml("");

    try {
      const payload = {
        industry,
        size,
        issue: trimmedIssue,
      };

      let reportText = "";
      let modelUsedName = "";
      let isDegradedModel = false;
      let isRealAiSuccess = false;
      let isQuotaExceeded = false;
      let quotaReportMessage = "";

      // Try endpoints sequentially: Cloud Run backend (for GitHub Pages), custom URL, and relative API
      const candidateEndpoints = getCandidateApiUrls("/api/diagnose");

      for (const endpoint of candidateEndpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 14000);

          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data.quotaExceeded) {
              isQuotaExceeded = true;
              quotaReportMessage = data.report || QUOTA_EXHAUSTED_CLIENT_MESSAGE;
              break;
            }
            if (data.success && data.report) {
              reportText = data.report;
              modelUsedName = data.modelUsed || "Gemini Flash";
              isDegradedModel = Boolean(data.isDegraded);
              isRealAiSuccess = true;
              break;
            }
          } else if (response.status === 429) {
            isQuotaExceeded = true;
            quotaReportMessage = QUOTA_EXHAUSTED_CLIENT_MESSAGE;
            break;
          }
        } catch (endpointErr) {
          console.warn(`[AI Diagnosis] Endpoint ${endpoint} attempt failed:`, endpointErr);
        }
      }

      if (isQuotaExceeded) {
        // Quota is exhausted! Do NOT answer the question, prompt to contact site manager
        reportText = quotaReportMessage || QUOTA_EXHAUSTED_CLIENT_MESSAGE;
        setReportType("quota");
        setModelEngineInfo(null);
      } else if (isRealAiSuccess && reportText) {
        setReportType("real_ai");
        setModelEngineInfo({
          model: modelUsedName,
          isDegraded: isDegradedModel,
        });
      } else {
        // No computing power / backend unreachable: do NOT answer question, prompt to contact site manager
        reportText = QUOTA_EXHAUSTED_CLIENT_MESSAGE;
        setReportType("quota");
        setModelEngineInfo(null);
      }

      setReportMarkdown(reportText);
      const parsed = await marked.parse(reportText);
      setRenderedHtml(parsed);

      try {
        localStorage.setItem(
          "last_diagnosis_data",
          JSON.stringify({
            industry,
            size,
            issue: trimmedIssue,
            aiResult: reportText,
          })
        );
      } catch (e) {
        // ignore storage quota
      }

      // Scroll result into view on mobile
      if (window.innerWidth < 768 && resultContainerRef.current) {
        resultContainerRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      // Quota exhausted or error: do NOT answer question, prompt to contact site manager
      setReportType("quota");
      setReportMarkdown(QUOTA_EXHAUSTED_CLIENT_MESSAGE);
      const parsed = await marked.parse(QUOTA_EXHAUSTED_CLIENT_MESSAGE);
      setRenderedHtml(parsed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRunDiagnosis();
  };

  const handleCopyReport = () => {
    if (!reportMarkdown) return;
    navigator.clipboard.writeText(reportMarkdown);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const disclaimerText =
    "【AI 診斷免責聲明】本報告由 AI 自動生成，僅供參考，不代表正式法律意見書。具體個案請以最新勞動法令、法院判決及專業律師、顧問團隊之書面意見為準。";

  const getPrintHtml = () => {
    if (!renderedHtml) return "";

    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>企業勞資戰略診斷報告 - 企業軍師Sandy企業勞資顧問團隊</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html {
      background: #f8fafc;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: 'Noto Sans TC', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      padding: 16mm 18mm 20mm 18mm;
      background: #ffffff;
      margin: 20px auto;
      width: 210mm;
      max-width: 100%;
      min-height: 297mm;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      word-break: break-word;
      overflow-wrap: break-word;
    }
    .report-header {
      border-bottom: 2.5px solid #F59E0B;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .report-title {
      color: #0f172a;
      font-size: 24px;
      font-weight: 800;
      margin: 0 0 2px 0;
      letter-spacing: -0.02em;
    }
    .report-subtitle {
      color: #b45309;
      font-size: 11px;
      font-weight: 600;
      margin: 2px 0 0 0;
      letter-spacing: 0.02em;
    }
    .contact-box {
      text-align: right;
      font-size: 12px;
      color: #475569;
      line-height: 1.5;
      flex-shrink: 0;
    }
    .contact-org {
      font-weight: 700;
      color: #0f172a;
      font-size: 12px;
    }
    .contact-hotline {
      font-weight: 700;
      color: #b45309;
      font-size: 12.5px;
      margin-top: 1px;
      margin-bottom: 2px;
    }
    .info-box {
      margin: 18px 0 22px 0;
      padding: 14px 18px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      page-break-inside: avoid;
    }
    .info-title {
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      font-size: 14px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      font-size: 13px;
    }
    .info-full {
      grid-column: span 2;
      margin-top: 4px;
    }
    h1 {
      font-size: 19px;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 20px;
      font-weight: 800;
    }
    h2, h3 {
      color: #0f172a;
      margin-top: 1.3em;
      border-left: 4px solid #F59E0B;
      padding-left: 10px;
      font-size: 15px;
      font-weight: 700;
    }
    table {
      width: 100% !important;
      max-width: 100% !important;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 12.5px;
      table-layout: fixed;
      page-break-inside: avoid;
      word-break: break-word;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    th {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 700;
    }
    td {
      color: #334155;
    }
    td:last-child {
      color: #dc2626;
      font-weight: 600;
    }
    strong {
      color: #b45309;
    }
    ul {
      padding-left: 20px;
      margin: 10px 0;
    }
    li {
      margin-bottom: 6px;
      font-size: 13.5px;
      color: #334155;
    }
    p {
      margin-bottom: 12px;
      font-size: 13.5px;
      color: #334155;
      line-height: 1.65;
    }
    pre, code {
      white-space: pre-wrap;
      word-break: break-word;
      max-width: 100%;
    }
    .report-body {
      color: #1e293b;
      line-height: 1.65;
      width: 100%;
      max-width: 100%;
    }
    #print-footer {
      margin-top: 36px;
      padding-top: 10px;
      border-top: 1px solid #cbd5e1;
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
      page-break-inside: avoid;
    }
    .disclaimer-bold {
      font-weight: 600;
      display: block;
      margin-bottom: 4px;
      color: #475569;
    }
    @media print {
      html, body {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        background: #ffffff !important;
      }
      #print-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: white;
        padding-top: 6px;
        border-top: 1px solid #cbd5e1;
      }
    }
  </style>
</head>
<body>
  <div class="report-header">
    <div>
      <div class="report-title">企業勞資戰略診斷報告</div>
      <div class="report-subtitle">策略人資總監觀點 ｜ 企業軍師Sandy企業勞資顧問團隊</div>
    </div>
    <div class="contact-box">
      <div class="contact-hotline">預約諮詢專線：0923-869696</div>
      <div><strong>E-mail：</strong>360.aiup@gmail.com</div>
      <div><strong>診斷日期：</strong>${new Date().toLocaleDateString("zh-TW")}</div>
    </div>
  </div>

  <div class="info-box">
    <div class="info-title">📋 諮詢企業背景資訊</div>
    <div class="info-grid">
      <div><strong>所屬行業：</strong>${industry}</div>
      <div><strong>公司規模：</strong>${size}</div>
      <div class="info-full"><strong>管理痛點／疑問：</strong><br>${(
        issue.trim() || "（未指定具體管理痛點）"
      ).replace(/\n/g, "<br>")}</div>
    </div>
  </div>

  <div class="report-body">
    ${renderedHtml}
  </div>

  <div id="print-footer">
    <span class="disclaimer-bold">${disclaimerText}</span>
    <div class="contact-org">企業軍師Sandy企業勞資顧問團隊</div>
    <div class="contact-hotline">預約諮詢專線：0923-869696</div>
  </div>
</body>
</html>`;
  };

  const openPrintInNewTab = () => {
    const printHtml = getPrintHtml();
    if (!printHtml) return;

    // Inject auto-print script in new tab
    const autoPrintHtml = printHtml.replace(
      "</body>",
      `<script>
        window.addEventListener('load', function() {
          setTimeout(function() {
            window.focus();
            window.print();
          }, 350);
        });
      <\/script></body>`
    );

    const blob = new Blob([autoPrintHtml], { type: "text/html;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const win = window.open(blobUrl, "_blank");

    if (!win) {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const handleDirectPrint = () => {
    const printHtml = getPrintHtml();
    if (!printHtml) return;

    // 1. Try off-screen visible iframe (visible to Chrome/Safari print engine)
    try {
      const oldFrame = document.getElementById("ai-print-frame");
      if (oldFrame) oldFrame.remove();

      const iframe = document.createElement("iframe");
      iframe.id = "ai-print-frame";
      iframe.style.position = "fixed";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      iframe.style.width = "1024px";
      iframe.style.height = "768px";
      iframe.style.opacity = "0.01";
      iframe.style.pointerEvents = "none";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(printHtml);
        frameDoc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.warn("Iframe print blocked, opening in new tab:", e);
            openPrintInNewTab();
          }
        }, 400);
        return;
      }
    } catch (err) {
      console.warn("Iframe creation error, falling back to new tab:", err);
    }

    // Fallback: new tab
    openPrintInNewTab();
  };

  const printReport = () => {
    if (!renderedHtml) return;
    // Always open preview modal for instant feedback
    setShowPrintModal(true);
    // Also trigger the direct print routine
    handleDirectPrint();
  };

  return (
    <section
      id="ai-tool"
      className="py-20 md:py-28 bg-slate-900 relative overflow-hidden border-b border-slate-800 bg-texture"
    >
      {/* Background imagery */}
      <div
        className="absolute inset-0 opacity-80 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000')",
        }}
      />
      <div className="absolute inset-0 bg-slate-950/85" />
      <div className="glow-effect top-0 left-0 transform -translate-x-1/4 -translate-y-1/4 opacity-40" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full mb-3 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>20 年 Fortune 500 策略人資總監觀點</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-shadow-lg">
            AI 企業勞資戰略風險快篩
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-base">
            以經營者視角出發，將法規遵循轉化為商業競爭力，快速檢視潛在財務罰鍰與關鍵行動計畫
          </p>
        </div>

        <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col md:flex-row min-h-[580px]">
          {/* Left: Input Form */}
          <div className="w-full md:w-5/12 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-700 flex flex-col justify-between">
            <form id="ai-form" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-slate-300 text-sm font-bold mb-2">
                  所屬行業
                </label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as IndustryType)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-amber-400 outline-none transition"
                >
                  <option value="製造業">製造業</option>
                  <option value="餐飲服務業">餐飲服務業</option>
                  <option value="零售業">零售業</option>
                  <option value="醫療院所">醫療院所</option>
                  <option value="長照機構">長照機構</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-bold mb-2">
                  公司規模
                </label>
                <select
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value as CompanySizeType)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-amber-400 outline-none transition"
                >
                  <option value="5人以下">5人以下（微型企業）</option>
                  <option value="5-30人">5-30人（中小型企業）</option>
                  <option value="31-100人">31-100人（成長型企業）</option>
                  <option value="100人以上">100人以上（大型企業）</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-slate-300 text-sm font-bold">
                    管理痛點 / 疑問
                  </label>
                  <span className="text-xs text-slate-400">具體描述利於精準診斷</span>
                </div>
                <textarea
                  id="issue"
                  rows={4}
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-amber-400 outline-none transition placeholder:text-slate-500 placeholder:italic text-sm leading-relaxed"
                  placeholder="請在此輸入您的管理痛點或疑問（例：不適任員工處置、加班費計算爭議、考勤制度、薪資結構優化...）"
                />
              </div>



              {errorMessage && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-xs flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-lg flex items-center justify-center transition shadow-lg active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <Zap className="w-5 h-5 mr-2 text-amber-400" />
                {isLoading ? "AI 診斷分析中..." : "開始 AI 診斷"}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center text-slate-300">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                2026 最新法規標準・策略人資總監觀點即時快篩
              </span>
              <span className="text-slate-400 hidden sm:inline">
                支援 A4 列印與專屬深度診斷
              </span>
            </div>
          </div>

          {/* Right: Diagnostic Output Container */}
          <div
            ref={resultContainerRef}
            className="w-full md:w-7/12 p-6 sm:p-8 bg-slate-950/70 flex flex-col relative justify-between"
          >
            {/* Placeholder state */}
            {!isLoading && !renderedHtml && (
              <div
                id="result-placeholder"
                className="m-auto text-slate-400 text-center py-12 px-4 max-w-md"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500 shadow-inner">
                  <Bot className="w-8 h-8 text-amber-400/80" />
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">
                  企業勞資戰略診斷報告
                </h3>
                <p className="text-sm font-medium text-slate-300 mb-3">
                  尚未產出診斷內容
                </p>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  請於左側選擇行業、規模並輸入所遇管理痛點或勞資疑問，點擊「開始 AI 診斷」即可即時產出法規風險評估與行動對策。
                </p>
                <div className="grid grid-cols-3 gap-2.5 text-[11px] text-slate-400">
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="block text-amber-400 font-semibold mb-0.5">即時快篩</span>
                    <span className="text-slate-400">法規合規度</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="block text-amber-400 font-semibold mb-0.5">裁罰清單</span>
                    <span className="text-slate-400">預估財務風險</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="block text-amber-400 font-semibold mb-0.5">實戰對策</span>
                    <span className="text-slate-400">總監級行動方案</span>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div
                id="loading-state"
                className="flex flex-col items-center justify-center h-full text-center py-16"
              >
                <div className="typing-indicator mb-4">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p className="text-amber-400 text-sm font-medium animate-pulse">
                  正在精準對接法令規範與勞檢標準...
                </p>
                <p className="text-slate-500 text-xs mt-2">
                  審核勞基法、職災保護法及司法判決案例
                </p>
              </div>
            )}

            {/* Diagnostic Result State */}
            {!isLoading && renderedHtml && (
              <div className="flex flex-col h-full">
                <div
                  id="ai-result-header"
                  className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3"
                >
                  <div className="flex items-center space-x-2">
                    {reportType === "quota" ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                        <h3 className="text-amber-400 font-bold text-base">今日 AI 額度已使用完畢</h3>
                      </>
                    ) : reportType === "guidance" ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        <h3 className="text-amber-400 font-bold text-base">勞資戰略快篩提示</h3>
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                        <h3 className="text-white font-bold text-base">企業勞資戰略診斷報告</h3>
                        {modelEngineInfo && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                            即時 AI 運算
                          </span>
                        )}
                      </>
                    )}

                    {reportType === "real_ai" && modelEngineInfo && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border flex items-center ${
                          modelEngineInfo.isDegraded
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                        title={
                          modelEngineInfo.isDegraded
                            ? `系統已自動啟動 5 級階梯降級機制 (當前調用: ${modelEngineInfo.model})，保障診斷服務不中斷`
                            : `使用 Google Gemini 深度推理引擎分析 (${modelEngineInfo.model || "gemini-3.8-flash"})`
                        }
                      >
                        <Cpu className="w-3 h-3 mr-1" />
                        {modelEngineInfo.isDegraded ? `已啟用階梯降級 (${modelEngineInfo.model})` : "Gemini 深度引擎"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {reportType !== "quota" && (
                      <>
                        <button
                          type="button"
                          onClick={handleCopyReport}
                          className="text-xs bg-slate-800 text-slate-200 hover:text-white px-3 py-1.5 rounded flex items-center border border-slate-700 hover:border-slate-500 transition"
                          title="複製報告文字"
                        >
                          {copiedSuccess ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1 text-green-400" />
                              已複製
                            </>
                          ) : (
                            "複製全文"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={printReport}
                          className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded flex items-center border border-slate-600 hover:border-amber-400 transition"
                        >
                          <Printer className="w-3.5 h-3.5 mr-1 text-amber-400" />
                          列印報告
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div
                  id="ai-result"
                  className="ai-report-content flex-grow overflow-y-auto pr-2 custom-scrollbar max-h-[500px]"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />

                {/* UI 免責聲明：灰色斜體 */}
                <div
                  id="ui-disclaimer"
                  className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 italic flex justify-between items-center"
                >
                  <span>AI 勞資問題診斷，僅提供參考，不構成法律建議！</span>
                  <a
                    href="#contact"
                    className="not-italic text-amber-400 hover:underline font-normal text-xs"
                  >
                    預約團隊深度輔導 &rarr;
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 列印報告預覽與匯出 Modal */}
      {showPrintModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden my-auto">
            {/* Modal 控制列 */}
            <div className="bg-slate-800/90 border-b border-slate-700 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="text-white font-bold text-sm sm:text-base">
                  列印診斷報告預覽
                </h3>
                <span className="text-[11px] bg-slate-700/80 text-amber-300 px-2 py-0.5 rounded border border-slate-600 font-medium hidden sm:inline-block">
                  標準 A4 規格 (210mm)
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleDirectPrint}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center text-xs shadow transition active:scale-95"
                  title="呼叫列印或另存為 PDF"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  立即列印 / 另存 PDF
                </button>
                <button
                  type="button"
                  onClick={openPrintInNewTab}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg flex items-center text-xs border border-slate-600 hover:border-amber-400 transition"
                  title="在獨立分頁開啟（防止瀏覽器封鎖列印彈窗）"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                  在新分頁開啟
                </button>
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg flex items-center text-xs border border-slate-700 transition"
                >
                  {copiedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5 text-green-400" />
                      已複製
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                      複製全文
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition"
                  title="關閉"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 提示橫幅 */}
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
              <span>
                💡 提示：若您的瀏覽器因安全外掛限制而未自動開啟列印視窗，請點選上方【在新分頁開啟】即可正常列印或另存為 PDF。
              </span>
            </div>

            {/* A4 格式報告預覽紙張 */}
            <div className="p-3 sm:p-6 overflow-y-auto bg-slate-950 flex-grow flex justify-center">
              <div className="bg-white text-slate-800 p-6 sm:p-10 rounded-xl shadow-2xl border border-slate-300 font-sans w-full max-w-[210mm] min-h-[297mm] mx-auto leading-relaxed text-sm box-border">
                {/* 頂部標題與專線 */}
                <div className="border-b-[2.5px] border-amber-500 pb-3 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 m-0 tracking-tight">
                      企業勞資戰略診斷報告
                    </h1>
                    <div className="text-amber-700 font-semibold text-[11px] mt-1 tracking-normal">
                      策略人資總監觀點 ｜ 企業軍師Sandy企業勞資顧問團隊
                    </div>
                  </div>
                  <div className="text-left sm:text-right text-xs text-slate-600 leading-relaxed shrink-0">
                    <div className="text-amber-700 font-bold">
                      預約諮詢專線：0923-869696
                    </div>
                    <div>
                      <strong>E-mail：</strong>360.aiup@gmail.com
                    </div>
                    <div>
                      <strong>診斷日期：</strong>
                      {new Date().toLocaleDateString("zh-TW")}
                    </div>
                  </div>
                </div>

                {/* 諮詢企業背景資訊 */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                  <div className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1 text-xs">
                    📋 諮詢企業背景資訊
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <strong>所屬行業：</strong>
                      {industry}
                    </div>
                    <div>
                      <strong>公司規模：</strong>
                      {size}
                    </div>
                    <div className="sm:col-span-2 mt-1">
                      <strong>管理痛點／疑問：</strong>
                      <div className="mt-1 whitespace-pre-wrap text-slate-700">
                        {issue.trim() || "（未指定具體管理痛點）"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 診斷報告內容 */}
                <div
                  className="print-preview-content leading-relaxed space-y-4 max-w-full overflow-hidden break-words"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />

                {/* 底部版權宣告與專線 */}
                <div className="mt-10 pt-4 border-t border-slate-300 text-[11px] text-slate-500 leading-relaxed">
                  <div className="font-semibold text-slate-700 mb-1">
                    {disclaimerText}
                  </div>
                  <div className="font-semibold text-slate-800">
                    企業軍師Sandy企業勞資顧問團隊
                  </div>
                  <div className="font-bold text-amber-800">
                    預約諮詢專線：0923-869696
                  </div>
                </div>
              </div>
            </div>

            {/* 底部關閉列 */}
            <div className="bg-slate-800/80 border-t border-slate-700 px-4 py-2.5 sm:px-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-4 py-1.5 rounded-lg transition"
              >
                關閉預覽
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
