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
              <h3 className="text-2xl font-bold text-white mb-1">資深勞資顧問團隊</h3>
              <p className="text-amber-400 text-lg font-bold">您的企業戰略夥伴</p>
              <p className="text-slate-400 text-xs mt-2">主持顧問：許顧問與法務人資智囊群</p>
            </div>

            <div className="w-full lg:w-2/3 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-full mb-4 text-xs text-amber-400 font-semibold">
                <Award className="w-3.5 h-3.5 mr-1" />
                20+ 年全方位顧問實務經驗
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                為什麼選擇我們？
              </h2>
              <p className="text-slate-300 mb-8 text-lg sm:text-xl leading-relaxed font-light">
                我們整合法律、財務與人力資源專家，不只是懂法條，更懂經營生意。團隊協助您建立
                <span className="text-amber-400 font-medium">「老闆睡得著覺、員工願意共同拚搏」</span>
                的長治久安制度。
              </p>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-left">
                  <div className="text-amber-400 mb-2">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div className="text-white font-bold text-sm mb-1">法律合規為盾</div>
                  <div className="text-slate-400 text-xs leading-relaxed">
                    全盤遵循勞動三法與職災專法，杜絕勞檢高額罰單。
                  </div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-left">
                  <div className="text-amber-400 mb-2">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="text-white font-bold text-sm mb-1">薪酬激勵為矛</div>
                  <div className="text-slate-400 text-xs leading-relaxed">
                    精準拆分薪資結構，將獲利與員工績效緊密鏈結。
                  </div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-left">
                  <div className="text-amber-400 mb-2">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-white font-bold text-sm mb-1">一對一實地輔導</div>
                  <div className="text-slate-400 text-xs leading-relaxed">
                    由許顧問親自領軍訪談，為您的企業量身客製落地方案。
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
