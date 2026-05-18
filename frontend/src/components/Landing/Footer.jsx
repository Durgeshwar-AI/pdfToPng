import React from "react";
import { Link } from "react-router-dom";
import { FileText, Lock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          <span className="text-xl font-bold text-slate-900">pdfToPng</span>
        </Link>
        <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
          <Lock className="w-4 h-4" /> Built for Privacy — No storage; files are
          deleted immediately after processing
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
  );
};

export default Footer;
