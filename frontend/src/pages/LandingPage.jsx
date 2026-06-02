

// import {FaBars, FaTimes} from 'react-icons/fa'
import React from "react";
import { lazy, Suspense } from "react";


import Navbar from "../components/Landing/Navbar";
import HeroSection from "../components/Landing/HeroSection";
const FeatureSection = lazy(() =>
  import("../components/Landing/FeatureSection")
);

const ToolsGrid = lazy(() =>
  import("../components/Landing/ToolsGrid")
);

const TrustBanner = lazy(() =>
  import("../components/Landing/TrustBanner")
);

const Footer = lazy(() =>
  import("../components/Landing/Footer")
);

const LandingPage = () => {
 

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
  <div className="absolute top-0 -left-40 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl" />
  <div className="absolute bottom-0 -right-40 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
</div>

      {/* Navbar */}
      <Navbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <HeroSection />
        {/* Features Row */}
        <Suspense fallback={null}>
        <FeatureSection />
        {/* Tools Grid Section */}
        <ToolsGrid />
        {/* Trust Banner */}
        <TrustBanner />
        </Suspense>
      </main>

      {/* Footer */}
      <Suspense fallback={null}>
      <Footer />
      </Suspense>

     
    </div>
  );
};

export default LandingPage;
