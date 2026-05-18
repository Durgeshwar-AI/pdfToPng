import React, { useState } from "react";
import { Link } from "react-router-dom";
// import {FaBars, FaTimes} from 'react-icons/fa'

import FeatureCard from "../components/Landing/FeatureCard";
import ToolCard from "../components/Landing/ToolCard";
import Navbar from "../components/Landing/Navbar";
import HeroSection from "../components/Landing/HeroSection";
import FeatureSection from "../components/Landing/FeatureSection";
import ToolsGrid from "../components/Landing/ToolsGrid";
import TrustBanner from "../components/Landing/TrustBanner";
import Footer from "../components/Landing/Footer";

const LandingPage = () => {
  const handleNavClick = (itemName) => {
    setActiveSection(itemName.toLowerCase());
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-300/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-300/30 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-cyan-200/30 rounded-full blur-[150px]" />
      </div>

      {/* Navbar */}
      <Navbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <HeroSection />
        {/* Features Row */}
        <FeatureSection />
        {/* Tools Grid Section */}
        <ToolsGrid />
        {/* Trust Banner */}
        <TrustBanner />
      </main>

      {/* Footer */}
      <Footer />

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        .animate-pulse { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  );
};

export default LandingPage;
