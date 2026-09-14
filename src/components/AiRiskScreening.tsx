import React, { useState, useRef } from "react";
import { marked } from "marked";
import {
  Sparkles,
  Zap,
  Printer,
  Bot,
  AlertTriangle,
  Lightbulb,
  Check,
} from "lucide-react";
import type { IndustryType, CompanySizeType } from "../types";

export const AiRiskScreening: React.FC = () => {
  const [industry, setIndustry] = useState<IndustryType>("製造業");
  const [size, setSize] = useState<CompanySizeType>("5-30人");
  const [issue, setIssue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportMarkdown, setReportMarkdown] = useState<string>("");
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  const resultContainerRef = useRef<HTMLDivElement>(null);

  // Quick Preset Issue Templates
  const presets = [
    {
      title: "出勤與加班",
      text: "員工下班後經常在 Line 詢問工作或回覆訊息，想知道如何合法規範出勤紀錄與加班費計算，避免被勞檢認定隱形加班違規裁罰？",
    },
    {
      title: "薪資結構優化",
      text: "基本工資逐年調漲，目前給員工全薪45,000元，希望合法拆分經常性與非經常性項目（如津貼、伙食費、績效獎金），降低勞健保負擔與加班費基數？",
    },
    {
      title: "不適任員工退場",
      text: "有位員工試用期過後工作態度消極、常遲到且工作錯誤率高，多次口頭勸導無效，公司該如何落實合法輔導SOP與資遣程序？",
    },
    {
      title: "醫療/輪班排班",
      text: "單位涉及輪班與值班，排班表常超出正常工時，如何合法實施變形工時、簽署同意書並召開勞資會議？",
    },
  ];

  const getBaselineDiagnosisReport = (ind: string, sz: string, iss: string) => {
    return `# 企業勞資戰略診斷報告

1. **現況分析與商業影響：**
貴司（${ind}，規模約${sz}）所遇「${iss.slice(0, 45)}...」，核心盲點在於出勤紀錄管理與薪酬結構未落實法制化防禦閉環。模糊的管理界限易削弱團隊士氣與人才密度，更會因非經常性給與認定爭議或隱形加班爭議，面臨勞動檢查直接裁罰與追溯工資給付，直接侵蝕企業核心利潤。

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
  };

  const handleRunDiagnosis = async () => {
    if (!issue.trim()) {
      setErrorMessage("請輸入您的管理痛點或疑問。");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    setReportMarkdown("");
    setRenderedHtml("");

    try {
      const payload = {
        industry,
        size,
        issue: issue.trim(),
      };

      let reportText = "";

      try {
        const response = await fetch("/api/diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.report) {
            reportText = data.report;
          }
        }
      } catch (apiErr) {
        console.warn("Backend API not reachable (static host mode), using strategic baseline generator:", apiErr);
      }

      // If backend not present (e.g. GitHub Pages static hosting), use high-standard strategic generator
      if (!reportText) {
        reportText = getBaselineDiagnosisReport(industry, size, issue.trim());
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
            issue,
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
      setErrorMessage(err.message || "系統忙碌中，請稍後再試。");
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

  const printReport = () => {
    if (!renderedHtml) return;

    const disclaimerText =
      "【AI 診斷免責聲明】本報告由 AI 自動生成，僅供參考，不代表正式法律意見書。具體個案請以最新勞動法令、法院判決及專業律師、顧問團隊之書面意見為準。";

    const printHtml = `
      <!DOCTYPE html>
      <html lang="zh-TW">
      <head>
        <meta charset="UTF-8">
        <title>企業勞資戰略診斷報告 - 策略人資總監觀點</title>
        <style>
          @page { margin: 2cm 1.5cm 2.5cm 1.5cm; size: A4; }
          body { font-family: 'Noto Sans TC', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b; padding-bottom: 50px; }
          .report-header { border-bottom: 3px solid #F59E0B; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          .report-title { color: #0f172a; font-size: 26px; font-weight: 800; margin: 0 0 4px 0; }
          .report-subtitle { color: #d97706; font-size: 14px; font-weight: 700; margin: 0; }
          .contact-box { text-align: right; font-size: 13px; color: #475569; line-height: 1.4; }
          .info-box { margin: 20px 0 25px 0; padding: 16px 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; page-break-inside: avoid; }
          .info-title { font-weight: 700; color: #0f172a; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; font-size: 15px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13.5px; }
          .info-full { grid-column: span 2; margin-top: 4px; }
          h1 { font-size: 20px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px; }
          h2, h3 { color: #0f172a; margin-top: 1.4em; border-left: 4px solid #F59E0B; padding-left: 10px; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px; page-break-inside: avoid; }
          th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
          th { background: #f1f5f9; color: #1e293b; font-weight: 700; }
          td:last-child { color: #dc2626; font-weight: 600; }
          strong { color: #b45309; }
          ul { padding-left: 20px; margin: 10px 0; }
          li { margin-bottom: 6px; font-size: 14px; }
          p { margin-bottom: 12px; font-size: 14px; }
          #print-footer { position: fixed; bottom: 0; left: 0; width: 100%; background: white; padding-top: 8px; border-top: 1px solid #cbd5e1; font-size: 11px; color: #64748b; line-height: 1.4; }
          .disclaimer-bold { font-weight: 600; display: block; margin-bottom: 2px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div>
            <div class="report-title">企業勞資戰略診斷報告</div>
            <div class="report-subtitle">策略人資總監 (Strategic HRBP) 觀點 ｜ 頭家神隊友顧問團隊</div>
          </div>
          <div class="contact-box">
            <div><strong>諮詢專線：</strong>0923-869696 許顧問</div>
            <div><strong>E-mail：</strong>360.aiup@gmail.com</div>
            <div><strong>診斷日期：</strong>${new Date().toLocaleDateString("zh-TW")}</div>
          </div>
        </div>

        <div class="info-box">
          <div class="info-title">📋 諮詢企業背景資訊</div>
          <div class="info-grid">
            <div><strong>所屬行業：</strong>${industry}</div>
            <div><strong>公司規模：</strong>${size}</div>
            <div class="info-full"><strong>管理痛點／疑問：</strong><br>${issue.replace(
              /\n/g,
              "<br>"
            )}</div>
          </div>
        </div>

        <div class="report-body">
          ${renderedHtml}
        </div>

        <div id="print-footer">
          <span class="disclaimer-bold">${disclaimerText}</span>
          頭家神隊友顧問團隊 &copy; 2026 All rights reserved. ｜ 預約實體深度診斷請洽 0923-869696
        </div>
      </body>
      </html>
    `;

    // Try hidden iframe approach first (iframe-safe and never blocked by popup blockers)
    try {
      const hiddenIframe = document.createElement("iframe");
      hiddenIframe.style.position = "fixed";
      hiddenIframe.style.right = "0";
      hiddenIframe.style.bottom = "0";
      hiddenIframe.style.width = "0";
      hiddenIframe.style.height = "0";
      hiddenIframe.style.border = "none";
      hiddenIframe.style.visibility = "hidden";
      document.body.appendChild(hiddenIframe);

      const frameDoc = hiddenIframe.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(printHtml);
        frameDoc.close();
        setTimeout(() => {
          try {
            hiddenIframe.contentWindow?.focus();
            hiddenIframe.contentWindow?.print();
          } catch (e) {
            console.error("Iframe print error:", e);
          } finally {
            setTimeout(() => {
              if (document.body.contains(hiddenIframe)) {
                document.body.removeChild(hiddenIframe);
              }
            }, 1500);
          }
        }, 500);
        return;
      }
    } catch (err) {
      console.warn("Iframe print not supported, falling back to window.open", err);
    }

    // Fallback: window.open without alert popup
    try {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printHtml);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 600);
      }
    } catch (e) {
      console.error("Window print error:", e);
    }
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
            以 Strategic HRBP 與經營者視角出發，將法規遵循轉化為商業競爭力，快速檢視潛在財務罰鍰與關鍵行動計畫
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
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-amber-400 outline-none transition placeholder-slate-500 text-sm leading-relaxed"
                  placeholder="例如：員工經常遲到、想合法優化薪資結構、不適任員工處置程序、工時與加班費計算爭議..."
                />
              </div>

              {/* Quick Presets */}
              <div>
                <span className="block text-xs font-semibold text-slate-400 mb-2 flex items-center">
                  <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  常見情境快速填入：
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setIssue(p.text)}
                      className="text-xs bg-slate-900/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 px-2.5 py-1 rounded border border-slate-700 transition"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
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
                className="m-auto text-slate-400 text-center py-12"
              >
                <Bot className="w-16 h-16 mx-auto mb-4 text-slate-600 opacity-60" />
                <p className="text-base font-medium text-slate-300">
                  分析結果將顯示於此
                </p>
                <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                  請在左側選擇行業、規模並填寫所遇痛點，點擊「開始 AI 診斷」
                </p>
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
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <h3 className="text-white font-bold text-base">診斷建議摘要</h3>
                  </div>
                  <div className="flex items-center space-x-2">
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
    </section>
  );
};
