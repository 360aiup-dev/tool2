import React, { useState } from "react";
import { ShieldCheck, Sparkles, Menu, X, MessageCircle } from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
        <a href="#" className="flex items-center text-white group">
          <ShieldCheck className="h-8 w-8 text-amber-500 mr-2 group-hover:scale-105 transition-transform" />
          <span className="text-xl font-bold tracking-wide">勞資戰略顧問</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 items-center">
          <a
            href="#ai-tool"
            className="text-amber-400 hover:text-white transition text-sm font-medium flex items-center"
          >
            <Sparkles className="w-4 h-4 mr-1 text-amber-400" />
            AI 快篩
          </a>
          <a
            href="#talent"
            className="text-slate-300 hover:text-amber-400 transition text-sm font-medium"
          >
            人才留任
          </a>
          <a
            href="#risk"
            className="text-slate-300 hover:text-amber-400 transition text-sm font-medium"
          >
            風險防禦
          </a>
          <a
            href="#management"
            className="text-slate-300 hover:text-amber-400 transition text-sm font-medium"
          >
            管理升級
          </a>
        </div>

        {/* Action Buttons (Right) */}
        <div className="hidden md:flex items-center space-x-3">
          <a
            id="nav-line-button"
            href="https://lin.ee/udQp9wm"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-2.5 px-4 rounded shadow-md transition transform hover:scale-105 inline-flex items-center text-sm"
          >
            <MessageCircle className="w-4 h-4 mr-1.5" />
            LINE 諮詢
          </a>
          <a
            id="nav-booking-button"
            href="#contact"
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2.5 px-5 rounded shadow-lg transition transform hover:scale-105 inline-block text-sm"
          >
            預約團隊診斷
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-slate-300 hover:text-white p-2 rounded focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-700 px-4 pt-2 pb-6 space-y-3">
          <a
            href="#ai-tool"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center text-amber-400 py-2 text-base font-medium"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI 快篩
          </a>
          <a
            href="#talent"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-amber-400 py-2 text-base font-medium"
          >
            人才留任
          </a>
          <a
            href="#risk"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-amber-400 py-2 text-base font-medium"
          >
            風險防禦
          </a>
          <a
            href="#management"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-amber-400 py-2 text-base font-medium"
          >
            管理升級
          </a>
          <div className="pt-2 space-y-2">
            <a
              id="mobile-nav-line-button"
              href="https://lin.ee/udQp9wm"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-3 rounded shadow text-base"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              LINE 立即諮詢
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded shadow"
            >
              預約團隊診斷
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
