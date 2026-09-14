import React, { useState } from "react";
import { CheckCircle, Phone, Mail, Send, ShieldCheck, Copy, ExternalLink, Check } from "lucide-react";
import type { ContactFormData } from "../types";

export const ContactFooter: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    company: "",
    name: "",
    phone: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [lastSubmitted, setLastSubmitted] = useState<any>(null);

  const TARGET_EMAIL = "360.aiup@gmail.com";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.name || !formData.phone) {
      setErrorMsg("請填寫完整的公司名稱、聯絡人姓名與聯絡電話。");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    let extraData: any = {};
    try {
      const saved = localStorage.getItem("last_diagnosis_data");
      if (saved) extraData = JSON.parse(saved);
    } catch (e) {
      // ignore parsing error
    }

    const payload = {
      ...formData,
      industry: extraData.industry || "",
      size: extraData.size || "",
      issue: extraData.issue || "",
      aiResult: extraData.aiResult || "",
    };

    setLastSubmitted(payload);

    try {
      // 1. Submit to server API which forwards to FormSubmit -> 360.aiup@gmail.com
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 2. Direct browser fallback dispatch to 360.aiup@gmail.com
      try {
        await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            _subject: `【高層預約】${payload.company} - 策略診斷請求`,
            _replyto: payload.email || "no-reply@example.com",
            "預約時間": new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }),
            "公司名稱": payload.company,
            "聯絡人": payload.name,
            "電話": payload.phone,
            "Email": payload.email,
            "產業別": payload.industry || "未指定",
            "公司規模": payload.size || "未指定",
            "諮詢問題": payload.issue || "未填寫",
            "AI診斷摘要": payload.aiResult ? String(payload.aiResult).slice(0, 800) : "無",
          }),
        });
      } catch (err2) {
        // non-blocking
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      company: "",
      name: "",
      phone: "",
      email: "",
    });
  };

  const mailSubject = encodeURIComponent(
    `【高層預約】${lastSubmitted?.company || formData.company || "企業客戶"} - 策略診斷請求`
  );
  const mailBody = encodeURIComponent(
    `頭家神隊友顧問團隊（許顧問）您好：\n\n` +
    `我們已於官網提交勞資戰略預約諮詢，詳細資訊如下：\n\n` +
    `■ 公司名稱：${lastSubmitted?.company || formData.company}\n` +
    `■ 聯絡人姓名／職稱：${lastSubmitted?.name || formData.name}\n` +
    `■ 聯絡電話：${lastSubmitted?.phone || formData.phone}\n` +
    `■ 電子信箱：${lastSubmitted?.email || formData.email}\n` +
    `■ 產業別：${lastSubmitted?.industry || "未指定"}\n` +
    `■ 公司規模：${lastSubmitted?.size || "未指定"}\n` +
    `■ 諮詢痛點／問題：${lastSubmitted?.issue || "一般勞資法規諮詢"}\n\n` +
    `請收件後儘速與我們聯繫，感謝！`
  );
  const mailtoUrl = `mailto:${TARGET_EMAIL}?subject=${mailSubject}&body=${mailBody}`;

  const handleCopySummary = () => {
    const text =
      `【高層預約諮詢摘要】\n` +
      `公司名稱：${lastSubmitted?.company || formData.company}\n` +
      `聯絡人：${lastSubmitted?.name || formData.name}\n` +
      `聯絡電話：${lastSubmitted?.phone || formData.phone}\n` +
      `電子信箱：${lastSubmitted?.email || formData.email}\n` +
      `產業別：${lastSubmitted?.industry || "未指定"}\n` +
      `公司規模：${lastSubmitted?.size || "未指定"}\n` +
      `諮詢事由：${lastSubmitted?.issue || "勞資戰略診斷"}\n` +
      `指定送達：${TARGET_EMAIL}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer id="contact" className="bg-slate-950 py-24 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 bg-slate-900 border border-amber-500/30 px-4 py-1.5 rounded-full mb-4 text-xs text-amber-400 font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span>防患未然．領先佈局</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          別等到收到法院傳票才找顧問！
        </h2>
        <p className="text-slate-300 mb-12 text-lg sm:text-xl font-normal opacity-90 max-w-xl mx-auto">
          現在就完善您的勞資防火牆。留下資料，我們將盡快與您聯繫。
        </p>

        {/* Booking Card */}
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl max-w-lg mx-auto mb-16 text-left relative overflow-hidden">
          {/* Success Overlay */}
          {isSubmitted && (
            <div
              id="contact-success"
              className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center text-center p-6 sm:p-8 animate-fade-in"
            >
              <CheckCircle className="w-16 h-16 text-emerald-500 mb-2" />
              <h3 className="text-2xl font-bold text-slate-900 mb-1">預約成功！</h3>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-900 mb-4 inline-flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0" />
                <span>系統已發送信件至指定信箱：<strong>{TARGET_EMAIL}</strong></span>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm mb-4 leading-relaxed max-w-xs">
                感謝您的填寫，顧問將於 48 小時內與您聯繫。為確保 100% 收到，您亦可點擊下方按鈕直接由您的信箱發送備份信：
              </p>

              <div className="w-full space-y-2.5 mb-4">
                <a
                  href={mailtoUrl}
                  className="w-full inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 px-4 rounded-lg shadow transition text-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  點此開啟信箱寄信至 {TARGET_EMAIL}
                </a>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="w-full inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-lg transition text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      已複製預約資料至剪貼簿！
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      複製預約資料摘要 (可傳至 Line)
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="text-slate-500 hover:text-slate-800 text-xs font-medium underline"
              >
                再填寫一筆預約
              </button>
            </div>
          )}

          <form id="contact-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-800 text-sm font-bold mb-1.5">
                公司名稱 <span className="text-red-500">*</span>
              </label>
              <input
                id="company"
                type="text"
                required
                value={formData.company}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-3.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-slate-900 transition text-sm"
                placeholder="輸入公司完整名稱或機構行號"
              />
            </div>

            <div>
              <label className="block text-slate-800 text-sm font-bold mb-1.5">
                聯絡人姓名／職稱 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-3.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-slate-900 transition text-sm"
                placeholder="例如：王小明 總經理 / 人資主管"
              />
            </div>

            <div>
              <label className="block text-slate-800 text-sm font-bold mb-1.5">
                電話 <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-3.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-slate-900 transition text-sm"
                placeholder="輸入方便聯繫的市話或手機"
              />
            </div>

            <div>
              <label className="block text-slate-800 text-sm font-bold mb-1.5">
                e-mail <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-3.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-slate-900 transition text-sm"
                placeholder="例如：boss@company.com"
              />
            </div>

            <div className="text-xs text-slate-500 flex items-center bg-slate-50 p-2.5 rounded border border-slate-200">
              <Mail className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0" />
              <span>送出後將同步排程通知負責顧問信箱：<strong className="text-slate-800">{TARGET_EMAIL}</strong></span>
            </div>

            {errorMsg && (
              <p className="text-red-600 text-xs font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-lg shadow-xl transition active:scale-98 flex items-center justify-center text-base cursor-pointer"
            >
              <Send className="w-4 h-4 mr-2 text-amber-400" />
              {isSubmitting ? "正在傳送預約至信箱..." : "確定送出預約"}
            </button>
          </form>
        </div>

        {/* Contact Info Footer */}
        <div className="border-t border-slate-800 pt-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-slate-200">
            <div className="flex items-center space-x-2 text-lg sm:text-xl font-bold tracking-wide text-white">
              <Phone className="w-5 h-5 text-amber-500" />
              <a href="tel:0923869696" className="hover:text-amber-400 transition">
                諮詢專線：0923-869696 許顧問
              </a>
            </div>
            <div className="hidden sm:block text-slate-600">|</div>
            <div className="flex items-center space-x-2 text-base font-medium text-slate-300">
              <Mail className="w-5 h-5 text-amber-500" />
              <a href={`mailto:${TARGET_EMAIL}`} className="hover:text-white transition">
                E-mail: {TARGET_EMAIL}
              </a>
            </div>
          </div>

          <div className="pt-6 space-y-1.5">
            <p className="text-slate-400 text-sm">
              &copy; 2026 凱爾亞力有限公司 資深勞資顧問團隊. All rights reserved.
            </p>
            <p className="text-slate-500 text-xs">
              本網站文案與分析僅供經營管理策略參考，不構成直接法律意見。
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
