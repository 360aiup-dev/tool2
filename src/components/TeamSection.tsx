import React from "react";
import { Users, Award, ShieldCheck, Scale, Compass } from "lucide-react";

export const TeamSection: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 md:p-16 lg:p-20 relative overflow-hidden bg-texture-blue shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10">
            <div className="w-full lg:w-1/3 text-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto bg-slate-800 rounded-full border-4 border-amber-500 flex items-center justify-center overflow-hidden mb-6 shadow-2xl relative group">
                <Users className="w-24 h-24 text-slate-400 group-hover:text-amber-400 transition-colors" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">資深勞資顧問</h3>
              <p className="text-amber-400 text-lg font-bold">您的企業戰略夥伴</p>
              <p className="text-slate-400 text-xs mt-2">許顧問與法務人資專業智囊團隊</p>
            </div>

            <div className="w-full lg:w-2/3 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-full mb-4 text-xs text-amber-400 font-semibold">
                <Award className="w-3.5 h-3.5 mr-1" />
                20+ 年企業勞資顧問實務經驗
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                為什麼選擇我？
              </h2>
              <p className="text-slate-300 mb-8 text-lg sm:text-xl leading-relaxed font-light">
                我不只懂法條，我更懂生意。我不教您鑽法律漏洞，而是教您建立一套讓
                <span className="text-amber-400 font-medium">老闆睡得著覺、員工願意拚命</span>
                的管理制度。
              </p>

              {/* 3 Metrics / Value Pillars from Google site */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-center">
                <div className="bg-slate-800/70 p-5 rounded-xl border border-slate-700/60">
                  <div className="text-3xl font-black text-amber-400 mb-1">100+</div>
                  <div className="text-sm font-bold text-white mb-1">經手爭議案例</div>
                  <div className="text-slate-400 text-xs">累積豐富實戰化解經驗</div>
                </div>

                <div className="bg-slate-800/70 p-5 rounded-xl border border-slate-700/60">
                  <div className="text-3xl font-black text-amber-400 mb-1">千萬</div>
                  <div className="text-sm font-bold text-white mb-1">節省潛在成本</div>
                  <div className="text-slate-400 text-xs">避免高額罰單與補償損失</div>
                </div>

                <div className="bg-slate-800/70 p-5 rounded-xl border border-slate-700/60">
                  <div className="text-3xl font-black text-amber-400 mb-1">專精</div>
                  <div className="text-sm font-bold text-white mb-1">製造 / 服務 / 長照</div>
                  <div className="text-slate-400 text-xs">量身客製各產業落地方案</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
