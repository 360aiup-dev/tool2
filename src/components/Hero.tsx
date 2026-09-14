import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <header className="relative pt-36 pb-20 lg:pt-48 lg:pb-36 gradient-bg overflow-hidden bg-texture">
      {/* Background imagery with subtle overlay */}
      <div
        className="absolute inset-0 opacity-80 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000')",
        }}
      />
      <div className="absolute inset-0 bg-slate-950/75" />

      {/* Decorative Glow */}
      <div className="glow-effect top-1/4 -left-48" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center z-10">
        <div className="w-full md:w-3/5 text-center md:text-left mb-12 md:mb-0">
          <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full border border-amber-500/40 bg-slate-900/80 backdrop-blur-md shadow-sm">
            <span className="text-amber-400 text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-amber-400" />
              專業勞資戰略夥伴．頭家神隊友
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 text-shadow-lg tracking-tight">
            別讓<span className="text-amber-400 underline decoration-amber-500/60 decoration-4 underline-offset-8">勞資爭議</span>
            <br />
            吃掉您的淨利
          </h1>

          <p className="text-lg md:text-xl text-slate-100 mb-8 max-w-2xl leading-relaxed text-shadow-lg font-normal">
            面對大缺工時代與工資調漲，只有合法的「薪酬佈局」與「風險控管」，守護企業辛苦經營的獲利。
          </p>

          {/* Quick value badges */}
          <div className="flex flex-wrap gap-y-2 gap-x-4 justify-center md:justify-start text-xs sm:text-sm text-slate-300 mb-8">
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 text-amber-400 mr-1.5" />
              勞動檢查預警分析
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 text-amber-400 mr-1.5" />
              薪資結構合規優化
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 text-amber-400 mr-1.5" />
              不適任員工輔導退場
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a
              href="#ai-tool"
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold py-4 px-8 rounded-lg shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center text-base"
            >
              <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
              開始 AI 診斷
              <ArrowRight className="ml-2 h-4 w-4 text-slate-700" />
            </a>
            <a
              href="#contact"
              className="border border-slate-600 hover:border-amber-400 text-slate-200 hover:text-white font-medium py-4 px-8 rounded-lg transition backdrop-blur-sm bg-slate-900/40 text-center"
            >
              預約一對一諮詢
            </a>
          </div>
        </div>

        <div className="w-full md:w-2/5 relative hidden md:block">
          <div className="absolute -inset-3 bg-amber-500/20 rounded-xl blur-2xl opacity-60" />
          <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700/70 group">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800"
              alt="勞資顧問團隊輔導"
              className="w-full h-auto object-cover transform group-hover:scale-102 transition duration-500"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-5">
              <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                實戰諮詢案例
              </div>
              <div className="text-white text-sm font-semibold">
                協助超過 500+ 中小企業與機構化解勞資風險與調薪難題
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
