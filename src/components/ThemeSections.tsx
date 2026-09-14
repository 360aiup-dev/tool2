import React from "react";
import {
  Lightbulb,
  ShieldAlert,
  Smartphone,
  RefreshCw,
  TrendingUp,
  FileCheck,
  CheckCircle,
} from "lucide-react";

export const ThemeSections: React.FC = () => {
  return (
    <>
      {/* 主題一：人才留任 */}
      <section id="talent" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <div className="relative group">
              <div className="absolute -inset-2 bg-amber-400/20 rounded-2xl blur-lg group-hover:bg-amber-400/30 transition"></div>
              <img
                src="https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&q=80&w=1000"
                alt="激勵型薪酬設計"
                className="relative rounded-xl shadow-2xl border border-slate-200 object-cover w-full h-[380px]"
              />
              <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-amber-400 text-xs font-bold px-3 py-1.5 rounded-md border border-slate-700">
                薪酬戰略佈局
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="flex items-center mb-4">
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded text-sm font-semibold mr-3 border border-slate-200">
                主題一：人才留任
              </span>
              <div className="h-px bg-slate-300 flex-grow"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              加薪也留不住人？<br className="hidden sm:inline" />
              建立「激勵型」薪資結構
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed text-lg">
              盲目調高底薪只會壓縮企業利潤並徒增加班費計算基數。我們團隊協助您設計能留住核心人才、變員工為夥伴的薪酬制度。
            </p>

            <div className="bg-slate-50 p-6 sm:p-8 rounded-xl border-l-4 border-amber-500 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center text-lg">
                <Lightbulb className="text-amber-500 mr-2 w-5 h-5 shrink-0" />
                團隊解決方案
              </h3>
              <ul className="space-y-3.5 text-slate-700 text-base">
                <li className="flex items-start">
                  <span className="text-amber-500 font-bold mr-2">•</span>
                  <div>
                    <strong className="text-slate-900">薪資結構優化：</strong>
                    拆解保障薪與績效獎金，合法節省成本，降低二代健保、勞保及加班費虛增風險。
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 font-bold mr-2">•</span>
                  <div>
                    <strong className="text-slate-900">留才金手銬：</strong>
                    核心幹部股權、分紅激勵機制與長期留任合約設計，讓關鍵人才與公司命運同頻。
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 主題二：風險防禦 */}
      <section id="risk" className="py-24 bg-slate-900 text-white relative bg-texture">
        <div
          className="absolute inset-0 opacity-90 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000')",
          }}
        />
        <div className="absolute inset-0 bg-slate-950/80" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row-reverse items-center gap-16 relative z-10">
          <div className="w-full lg:w-1/2">
            <div className="relative group">
              <div className="absolute -inset-2 bg-amber-500/10 rounded-2xl blur-lg group-hover:bg-amber-500/20 transition"></div>
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000"
                alt="勞動法規風險防禦"
                className="relative rounded-xl shadow-2xl border border-slate-700 w-full h-[380px] object-cover grayscale hover:grayscale-0 transition duration-500"
              />
              <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md text-amber-400 text-xs font-bold px-3 py-1.5 rounded-md border border-slate-700">
                勞檢罰鍰零容忍
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="flex items-center mb-4">
              <span className="bg-slate-800 text-amber-400 px-3 py-1 rounded text-sm font-semibold mr-3 border border-slate-700">
                主題二：風險防禦
              </span>
              <div className="h-px bg-slate-700 flex-grow"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-shadow-lg text-white tracking-tight">
              勞檢與訴訟不是機率問題<br />
              而是內容「防禦強度」問題
            </h2>
            <p className="text-slate-200 mb-8 leading-relaxed text-lg font-light">
              職災法規加嚴，勞權意識抬頭。我們為您建立嚴密的法規防火牆，拒絕讓一張勞檢罰單或勞資調解成為企業的營利破口。
            </p>

            <div className="bg-slate-800/85 p-6 sm:p-8 rounded-xl border-l-4 border-amber-500 backdrop-blur-sm shadow-xl">
              <h3 className="font-bold mb-4 flex items-center text-lg text-white">
                <ShieldAlert className="text-amber-500 mr-2 w-5 h-5 shrink-0" />
                團隊解決方案
              </h3>
              <ul className="space-y-3.5 text-slate-300 text-base">
                <li className="flex items-start">
                  <span className="text-amber-400 font-bold mr-2">•</span>
                  <div>
                    <strong className="text-amber-300">契約客製化：</strong>
                    針對醫療院所、產線、業務等不同職務量身訂做勞動契約，避免範本漏洞。
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 font-bold mr-2">•</span>
                  <div>
                    <strong className="text-amber-300">法制化管理：</strong>
                    完善工作規則送核備與獎懲機制，掌握合法資遣與不適任員工輔導之關鍵舉證鏈。
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 主題三：管理升級 */}
      <section id="management" className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-amber-600 font-bold tracking-wider uppercase text-sm">
            主題三：管理升級
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-16 tracking-tight">
            AI 時代與醫管轉型，您的制度跟上了嗎？
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg border-t-4 border-slate-900 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-6 text-slate-900">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">數位工時管理</h3>
              <p className="text-slate-600 text-base leading-relaxed mb-4">
                建立符合現代混合辦公與通訊軟體環境的「打卡與離線機制」，杜絕隱形加班與 Line 交辦下達後的巨額加班費追討爭議。
              </p>
              <div className="text-xs text-amber-600 font-semibold flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                符合勞基法第30條出勤紀錄規範
              </div>
            </div>

            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg border-t-4 border-amber-500 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center mb-6 text-amber-500">
                <RefreshCw className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">組織轉型調動</h3>
              <p className="text-slate-600 text-base leading-relaxed mb-4">
                精準運用勞基法「調動五原則」與績效考核制度，協助企業在業務擴張、門市縮編或整併時進行合法、和諧的人力資源優化。
              </p>
              <div className="text-xs text-amber-600 font-semibold flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                降低勞資爭議調解與離職金糾紛
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
