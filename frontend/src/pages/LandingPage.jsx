import React from "react";
import { Link } from "react-router-dom";
import { FileText, Image, FileImage, Eraser, ShieldCheck, Zap, Lock } from "lucide-react";

const LandingPage = () => {
  const tools = [
    {
      id: "pdf-to-png",
      name: "PDF to PNG",
      icon: <FileText className="w-8 h-8" />,
      description: "Convert single-page PDF documents into high-quality PNG images instantly.",
      path: "/pdf-to-png"
    },
    {
      id: "image-to-webp",
      name: "Image to WebP",
      icon: <Image className="w-8 h-8" />,
      description: "Optimize your images for the web by converting them to the modern WebP format.",
      path: "/image-to-webp"
    },
    {
      id: "image-to-jpg",
      name: "Image to JPG",
      icon: <FileImage className="w-8 h-8" />,
      description: "Standardize your image formats by converting PNGs, WebPs, and more to JPG.",
      path: "/image-to-jpg"
    },
    {
      id: "remove-bg",
      name: "Remove Background",
      icon: <Eraser className="w-8 h-8" />,
      description: "Extract subjects from their backgrounds instantly with AI-powered processing.",
      path: "/remove-bg"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-[#4361ee] selection:text-white">
      {/* Navbar Placeholder for Landing Page */}
      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-[#4361ee]">
          <FileText className="w-8 h-8" />
          <span className="text-2xl font-bold text-slate-800">pdfToPng</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Powerful File Tools.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4361ee] to-[#7209b7]">
            Zero Third-Party Storage.
          </span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Convert, optimize, and edit your files effortlessly. Built with a privacy-first architecture so your data remains exclusively yours.
        </p>

        {/* Privacy Callout Banner */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-blue-50 border border-blue-100 px-8 py-4 rounded-2xl mb-20 text-blue-800 shadow-sm">
          <div className="flex items-center gap-2 font-semibold">
            <Lock className="w-5 h-5 text-blue-600" />
            100% Private Processing
          </div>
          <div className="hidden sm:block w-px h-6 bg-blue-200"></div>
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            No Files Stored
          </div>
          <div className="hidden sm:block w-px h-6 bg-blue-200"></div>
          <div className="flex items-center gap-2 font-semibold">
            <Zap className="w-5 h-5 text-blue-600" />
            Fast & Free
          </div>
        </div>

        {/* Tools Grid */}
        <h2 className="text-3xl font-bold text-slate-800 mb-10">Choose a Tool</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Link 
              key={tool.id} 
              to={tool.path}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group text-left flex flex-col"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-[#4361ee] mb-6 group-hover:bg-[#4361ee] group-hover:text-white transition-colors">
                {tool.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{tool.name}</h3>
              <p className="text-slate-500 text-sm leading-relaxed flex-1">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;