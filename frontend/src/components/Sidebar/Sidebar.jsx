import React, { useState } from "react";
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

const Sidebar = ({
  activeTab,
  onTabChange,
  isMobileMenuOpen,
  isMobile,
  onClose,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    {
      id: "pdf-to-png",
      label: "PDF to PNG",
      icon: <FileText className="w-5 h-5" />,
      description: "Convert PDF files to PNG images",
    },
    {
      id: "image-to-webp",
      label: "Image to WebP",
      icon: <Image className="w-5 h-5" />,
      description: "Convert images to WebP format",
    },
    {
      id: "image-to-jpg",
      label: "Image to JPG",
      icon: <FileImage className="w-5 h-5" />,
      description: "Convert images to JPG format",
    },
    {
      id: "remove-bg",
      label: "Remove Background",
      icon: <Eraser className="w-5 h-5" />,
      description: "Remove background from images",
    },
    {
      id: "image-compress",
      label: "Image Compressor",
      icon: <Sliders className="w-5 h-5" />,
      description: "Compress images with quality control",
    },
    {
      id: "rotate-flip",
      label: "Rotate & Flip",
      icon: <RotateCcw className="w-5 h-5" />,
      description: "Rotate or flip your images",
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
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
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          {isMobile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-400" />
                <h1 className="text-xl font-bold">pdfToPng</h1>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : isCollapsed ? (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-400" />
                <h1 className="text-xl font-bold">pdfToPng</h1>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onTabChange(item.id);
                    if (isMobile) onClose();
                  }}
                  className={`
                    w-full flex ${isCollapsed ? "flex-col" : "flex-row"} items-center gap-3 p-3 rounded-lg transition-all
                    ${
                      activeTab === item.id
                        ? "bg-blue-600 text-white shadow-lg"
                        : "hover:bg-slate-700 text-slate-300"
                    }
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

        {/* Footer */}
        {!isCollapsed && !isMobile && (
          <div className="p-4 border-t border-slate-700">
            <p className="text-sm text-slate-400 text-center">
              Convert your files easily
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
