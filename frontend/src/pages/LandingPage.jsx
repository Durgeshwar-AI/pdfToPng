import React from "react";
import { Link } from "react-router-dom";
import { 
  FileText, Image, FileImage, Eraser, Shield, Zap, 
  HardDrive, ArrowRight, Github, Sparkles, Lock, Globe, Star,
  RotateCcw, Sliders
} from "lucide-react";

const FeatureCard = ({ icon, title, description, gradient, index }) => (
  <div 
    className="group relative p-8 rounded-2xl bg-white shadow-sm border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
    style={{ animationDelay: `${800 + index * 100}ms` }}
  >
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10" 
         style={{ background: `linear-gradient(135deg, ${gradient.split(' ')[1]}, transparent)` }} />
    
    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} p-[1px] mb-6`}>
      <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
        {icon}
      </div>
    </div>
    
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
  </div>
);

const ToolCard = ({ tool, index }) => (
  <Link 
    to={tool.path}
    className="group relative p-8 rounded-2xl bg-white shadow-sm border border-slate-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-slate-300 animate-fade-in-up flex flex-col"
    style={{ animationDelay: `${1000 + index * 100}ms` }}
  >
    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
    
    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.iconGradient} p-[1px] mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
      <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
        {React.cloneElement(tool.icon, { className: "w-7 h-7 text-slate-800" })}
      </div>
    </div>
    
    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-blue-700 group-hover:bg-clip-text transition-all duration-300">
      {tool.name}
    </h3>
    <p className="text-slate-600 text-sm leading-relaxed flex-1">
      {tool.description}
    </p>
    
    <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
      <ArrowRight className="w-6 h-6 text-blue-600" />
    </div>
  </Link>
);

// --- MAIN PAGE DATA & LAYOUT ---

const tools = [
  {
    id: "pdf-to-png",
    name: "PDF to PNG",
    icon: <FileText className="w-8 h-8" />,
    description: "Convert single-page PDF documents into high-quality PNG images instantly.",
    path: "/pdf-to-png",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconGradient: "from-amber-500 to-orange-500",
  },
  {
    id: "image-to-webp",
    name: "Image to WebP",
    icon: <Image className="w-8 h-8" />,
    description: "Optimize your images for the web by converting them to the modern WebP format.",
    path: "/image-to-webp",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconGradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "image-to-jpg",
    name: "Image to JPG",
    icon: <FileImage className="w-8 h-8" />,
    description: "Standardize your image formats by converting PNGs, WebPs, and more to JPG.",
    path: "/image-to-jpg",
    gradient: "from-blue-500/10 to-indigo-500/10",
    iconGradient: "from-blue-500 to-indigo-500",
  },
  {
    id: "remove-bg",
    name: "Remove Background",
    icon: <Eraser className="w-8 h-8" />,
    description: "Extract subjects from their backgrounds instantly with AI-powered processing.",
    path: "/remove-bg",
    gradient: "from-purple-500/10 to-pink-500/10",
    iconGradient: "from-purple-500 to-pink-500",
  }
  ,
  {
    id: "rotate-flip",
    name: "Rotate & Flip",
    icon: <RotateCcw className="w-8 h-8" />,
    description: "Rotate or flip images quickly with lossless transforms.",
    path: "/rotate-flip",
    gradient: "from-indigo-500/10 to-violet-500/10",
    iconGradient: "from-indigo-500 to-violet-500",
  },
  {
    id: "image-compress",
    name: "Image Compressor",
    icon: <Sliders className="w-8 h-8" />,
    description: "Reduce image size with adjustable quality settings — runs locally or transiently on the server.",
    path: "/image-compress",
    gradient: "from-rose-500/10 to-pink-500/10",
    iconGradient: "from-rose-500 to-pink-500",
  }
];

const features = [
  {
    icon: <Lock className="w-7 h-7 text-blue-600" />,
    title: "100% Private",
    description: "Privacy-first: files are not persistently stored. Processing happens locally when possible; any server-side work is transient and never retained.",
    gradient: "from-cyan-500 to-blue-500"
  },
  {
    icon: <Zap className="w-7 h-7 text-orange-500" />,
    title: "Lightning Fast",
    description: "Instant conversions with no waiting for uploads or downloads",
    gradient: "from-amber-500 to-orange-500"
  },
  {
    icon: <HardDrive className="w-7 h-7 text-teal-500" />,
    title: "No Storage Limits",
    description: "We do not persist user files — no data storage at any cost.",
    gradient: "from-emerald-500 to-teal-500"
  }
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-300/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-300/30 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-200/30 rounded-full blur-[150px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link to="/" className="group flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <FileText className="relative w-8 h-8 text-purple-600" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            pdfToPng
          </span>
        </Link>
        <a 
          href="https://github.com/Durgeshwar-AI/pdfToPng" 
          target="_blank" 
          rel="noreferrer" 
          className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-300 hover:scale-105"
        >
          <Github className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
          <span className="text-slate-600 group-hover:text-slate-900 font-medium transition-colors hidden sm:inline">Star on GitHub</span>
        </a>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200 mb-8 animate-fade-in-up">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-slate-600">Privacy-First — Files Are Not Stored</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 animate-fade-in-up animation-delay-200">
            <span className="text-slate-900">Local & Private</span><br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">File Tools</span>
          </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
            Convert, optimize, and edit your files with privacy as a priority. Tools run locally when possible; for operations that require a server, files are sent only transiently and are not stored.
            <span className="block text-lg text-slate-500 mt-2 font-medium">No storage. No data leaks. Fast, private tools.</span>
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 animate-fade-in-up animation-delay-600">
            <a href="#tools" className="group relative px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
              <div className="relative flex items-center gap-2 text-white">
                Explore Tools <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
            <div className="flex items-center gap-2 text-slate-600 text-sm border border-slate-200 px-5 py-3 rounded-xl bg-white shadow-sm">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Free • No Signup Required • Unlimited</span>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-500">
            {['No persistent storage', 'Client-side by default', 'Open source & auditable'].map((text, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features Row */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} index={idx} />
            ))}
          </div>
        </section>

        {/* Tools Grid Section */}
        <section id="tools" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 mb-6">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-orange-700">Professional Tools</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-900">Everything You Need</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Choose from our suite of powerful, privacy-first conversion tools</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, idx) => (
              <ToolCard key={tool.id} tool={tool} index={idx} />
            ))}
          </div>
        </section>

        {/* Trust Banner */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-200 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-[80px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-[80px] -z-10" />
            
            <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <Globe className="w-5 h-5 text-emerald-500" />
                  <span className="text-emerald-600 text-sm font-bold tracking-wide uppercase">Privacy-First Processing</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Your privacy is our priority</h3>
                <p className="text-slate-600 font-medium">Open source, auditable, and designed to avoid persistent storage of your files.</p>
              </div>
              <div className="flex items-center gap-2 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-slate-900 font-extrabold ml-2 text-lg">4.9</span>
                <span className="text-slate-500 font-medium">/5</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            <span className="text-xl font-bold text-slate-900">pdfToPng</span>
          </Link>
          <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Built for Privacy — No storage; files are deleted immediately after processing
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Made with</span>
            <span className="text-red-500 animate-pulse text-lg">❤️</span>
            <span className="text-sm font-medium text-slate-500">for GSSoC</span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-2" />
            <span className="text-xs font-bold text-slate-400">v1.0.0</span>
          </div>
        </div>
      </footer>

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