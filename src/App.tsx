import React from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { AiRiskScreening } from "./components/AiRiskScreening";
import { ThemeSections } from "./components/ThemeSections";
import { TeamSection } from "./components/TeamSection";
import { ContactFooter } from "./components/ContactFooter";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-amber-500 selection:text-slate-900">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <AiRiskScreening />
        <ThemeSections />
        <TeamSection />
      </main>
      <ContactFooter />
    </div>
  );
}
