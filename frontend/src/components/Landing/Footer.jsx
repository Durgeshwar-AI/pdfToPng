import React from "react";
import { Link } from "react-router-dom";
import { FileText, Lock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        
      
        <div className="grid md:grid-cols-3 gap-10">

        
          <div>
            <Link to="/" className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              <span className="text-3xl font-bold text-slate-900">
                pdfToPng
              </span>
            </Link>
          </div>

        
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 text-lg">
              Contact
            </h3>

            <div  className="flex flex-col gap-2 text-slate-500">
              <a  className="hover:text-purple-600 transition-colors"
               href="https://github.com/Durgeshwar-AI"
               target="_blank" 
               rel="noopener noreferrer">
                GitHub
              </a>
              <a  className="hover:text-purple-600 transition-colors"
               href={import.meta.env.VITE_LINKEDIN_URL}
               target="_blank" 
               rel="noopener noreferrer">
                LinkedIn
              </a>
              <a  className="hover:text-purple-600 transition-colors"
               href={`mailto:${import.meta.env.VITE_EMAIL}`}
               target="_blank" 
               rel="noopener noreferrer">
                Email
              </a>
            </div>
          </div>

          
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 text-lg">
              Support
            </h3>

            <div className="flex flex-col gap-2 text-slate-500">
              <a className="hover:text-purple-600 transition-colors"
              href="https://github.com/Durgeshwar-AI/pdfToPng/issues?q=is%3Aissue%20state%3Aopen"
              target="_blank" 
               rel="noopener noreferrer">
                Report a Bug</a>
            </div>
          </div>

        </div>

        
        <div className="border-t border-slate-200 mt-10 pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Built for Privacy — No storage; files are deleted immediately after
            processing
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">
              Made with
            </span>
            <span className="text-red-500 animate-pulse text-lg">❤️</span>
            <span className="text-sm font-medium text-slate-500">
              for developers
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-2" />
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
