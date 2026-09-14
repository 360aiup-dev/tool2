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
              <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded text-sm font-semibold mr-3 border border-slate-200">
                主題一：人才留任
              </span>
              <div className="h-px bg-slate-300 flex-grow"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              加薪也留不住人？<br className="hidden sm:inline" />
              因為您缺乏「激勵型」薪資結構
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed text-lg">
              面對大缺工與基本工資調漲，盲目加底薪只會壓縮獲利。年輕世代看重的是公平性與未來性。
            </p>

            <div className="bg-slate-50 p-6 sm:p-8 rounded-xl border-l-4 border-amber-500 shadow-sm mb-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center text-lg">
                <Lightbulb className="text-amber-500 mr-2 w-5 h-5 shrink-0" />
                顧問解決方案
              </h3>
              <ul className="space-y-3.5 text-slate-700 text-base">
                <li className="flex items-start">
                  <span className="text-amber-500 font-bold mr-2">•</span>
                  <div>
                    <strong className="text-slate-900">薪資結構重組：</strong>
                    拆解保障薪與績效獎金，合法優化勞健保成本。
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 font-bold mr-2">•</span>
                  <div>
                    <strong className="text-slate-900">留才金手銬：</strong>
                    設計核心幹部股權與保單計畫，變員工為夥伴。
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-4 text-amber-900 text-sm font-medium italic">
              「別讓無效的加薪，變成養懶人的溫床。」
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
              而是「時間」問題
            </h2>
            <p className="text-slate-200 mb-8 leading-relaxed text-lg font-light">
              職災法規加嚴，勞權意識抬頭。只要一名員工離職後檢舉，一張罰單可能就是幾萬起跳，更別提補發加班費的百萬鉅款。
            </p>

            <div className="bg-slate-800/85 p-6 sm:p-8 rounded-xl border-l-4 border-amber-500 backdrop-blur-sm shadow-xl mb-6">
              <h3 className="font-bold mb-4 flex items-center text-lg text-white">
                <ShieldAlert className="text-amber-500 mr-2 w-5 h-5 shrink-0" />
                顧問解決方案
              </h3>
              <ul className="space-y-3.5 text-slate-300 text-base">
                <li className="flex items-start">
                  <span className="text-amber-400 font-bold mr-2">•</span>
                  <div>
                    <strong className="text-amber-300">契約客製化：</strong>
                    拒絕罐頭合約，針對職務量身訂做防禦型契約。
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 font-bold mr-2">•</span>
                  <div>
                    <strong className="text-amber-300">工作規則法制化：</strong>
                    明確定義加班申請與考核，杜絕情緒勒索。
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/70 border border-slate-700 rounded-lg p-4 text-amber-300 text-sm font-medium italic">
              「一份完善的契約，比請十個律師打官司更便宜。」
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
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4 tracking-tight">
            AI 時代與彈性工時，您的管理跟上法規了嗎？
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mb-14 max-w-3xl mx-auto">
            LINE交辦工作算加班嗎？導入AI如何合法資遣？模糊地帶正是勞資糾紛的溫床。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg border-t-4 border-slate-900 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-6 text-slate-900">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">數位工時規範</h3>
              <p className="text-slate-600 text-base leading-relaxed mb-4">
                建立符合法規的「遠端工作打卡機制」與「離線權」規範，避免通訊軟體加班費爭議。
              </p>
              <div className="text-xs text-amber-600 font-semibold flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                符合勞動基準法出勤紀錄與離線權合規要求
              </div>
            </div>

            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg border-t-4 border-amber-500 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center mb-6 text-amber-500">
                <RefreshCw className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">合法調動與轉型</h3>
              <p className="text-slate-600 text-base leading-relaxed mb-4">
                協助您在數位轉型陣痛期，運用「調動五原則」，以最合諧合法的方式進行組織瘦身。
              </p>
              <div className="text-xs text-amber-600 font-semibold flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                兼顧組織轉型效率與法制化防禦保護
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
