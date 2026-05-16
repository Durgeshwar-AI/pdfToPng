import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FileText,
  Image,
  FileImage,
  Eraser,
  RotateCcw,
  X,
  Sliders,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({ activeTab, isMobileMenuOpen, isMobile, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const menuItems = [
    {
      id: "pdf-to-png",
      label: "PDF to PNG",
      icon: <FileText className="w-5 h-5" />,
      description: "Convert PDF to PNG",
    },
    {
      id: "image-compress",
      label: "Image Compressor",
      icon: <Sliders className="w-5 h-5" />,
      description: "Compress images with quality control",
    },
    {
      id: "image-upscale",
      label: "AI Upscaler",
      icon: <Sliders className="w-5 h-5 text-purple-500" />,
      description: "Increase image resolution",
    },
    {
      id: "image-to-webp",
      label: "Image to WebP",
      icon: <Image className="w-5 h-5" />,
      description: "Convert to WebP",
    },
    {
      id: "image-to-jpg",
      label: "Image to JPG",
      icon: <FileImage className="w-5 h-5" />,
      description: "Convert to JPG",
    },
    {
      id: "remove-bg",
      label: "Remove Background",
      icon: <Eraser className="w-5 h-5" />,
      description: "Remove background",
    },
    {
      id: "rotate-flip",
      label: "Rotate & Flip",
      icon: <RotateCcw className="w-5 h-5" />,
      description: "Rotate or flip images",
    },
    {
      id: "image-compress",
      label: "Image Compressor",
      icon: <Sliders className="w-5 h-5" />,
      description: "Compress images",
    },
  ];

  const handleNavigation = (id) => {
    navigate(`/${id}`);
    if (isMobile) onClose();
  };

  return (
    <>
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          ${isMobile ? "fixed" : "sticky"} 
          top-0 left-0 h-screen bg-white
          text-blue-500 transition-all duration-300 ease-in-out z-50
          ${isMobile && !isMobileMenuOpen ? "-translate-x-full" : "translate-x-0"}
          ${!isMobile && isCollapsed ? "w-20" : "w-80"}
          flex flex-col shadow-xl
        `}
      >
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {(!isCollapsed || isMobile) && (
              <Link
                to="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <FileText className="w-6 h-6 text-blue-400" />
                <h1 className="text-xl font-bold">pdfToPng</h1>
              </Link>
            )}
            <button
              onClick={isMobile ? onClose : toggleSidebar}
              className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${isCollapsed && !isMobile ? "mx-auto" : ""}`}
            >
              {isMobile ? (
                <X className="w-5 h-5" />
              ) : isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    w-full flex ${isCollapsed ? "flex-col" : "flex-row"} items-center gap-3 p-3 rounded-lg transition-all
                    ${activeTab === item.id ? "bg-blue-600 text-white shadow-lg" : "hover:bg-slate-50 text-slate-600"}
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                  title={isCollapsed ? item.label : ""}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-75 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
