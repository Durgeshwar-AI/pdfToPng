

import DeferredSection from "../components/Landing/DeferredSection";

import Navbar from "../components/Landing/Navbar";
import HeroSection from "../components/Landing/HeroSection";

const LandingPage = () => {
 

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 font-sans selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
  <div className="absolute top-0 -left-40 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl" />
  <div className="absolute bottom-0 -right-40 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
</div>

      {/* Navbar */}
      <Navbar />

      <main id="main-content" tabIndex={-1} className="relative z-10">
        {/* Hero Section */}
        <HeroSection />
        <DeferredSection
          load={() => import("../components/Landing/FeatureSection")}
          placeholderClassName="min-h-32"
        />
        <DeferredSection
          load={() => import("../components/Landing/ToolsGrid")}
          placeholderClassName="min-h-96"
        />
        <DeferredSection
          load={() => import("../components/Landing/TrustBanner")}
          placeholderClassName="min-h-32"
        />
      </main>

      <DeferredSection
        load={() => import("../components/Landing/Footer")}
        placeholderClassName="min-h-32"
      />
    </div>
  );
};

export default LandingPage;
