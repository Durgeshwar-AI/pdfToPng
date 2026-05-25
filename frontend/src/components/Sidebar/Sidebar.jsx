import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Sparkles,
  Info,
  Github,
} from "lucide-react";
import tools from "../../data/toolsData";

const Sidebar = ({ activeTab, isMobileMenuOpen, isMobile, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const pageItems = [
    {
      id: "home",
      label: "Home",
      path: "/",
      icon: <FileText className="w-5 h-5" />,
      description: "Back to the landing page",
    },
    {
      id: "about",
      label: "About",
      path: "/about",
      icon: <Info className="w-5 h-5" />,
      description: "Project background and goals",
    },
    {
      id: "features",
      label: "Features",
      path: "/features",
      icon: <Sparkles className="w-5 h-5" />,
      description: "What the site can do",
    },
    {
      id: "faq",
      label: "FAQ",
      path: "/faq",
      icon: <CircleHelp className="w-5 h-5" />,
      description: "Common questions and answers",
    },
  ];

  const menuItems = tools.map((t) => ({
    id: t.id,
    label: t.name,
    icon: React.cloneElement(t.icon, { className: "w-5 h-5" }),
    description: t.description,
  }));

  const handleNavigation = (id) => {
    navigate(`/${id}`);
    if (isMobile) onClose();
  };

  const isPageActive = (item) => {
    if (item.id === "home") {
      return activeTab === "";
    }

    return activeTab === item.id;
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
          <ul className="space-y-2 mb-6">
            {pageItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    w-full flex ${isCollapsed ? "flex-col" : "flex-row"} items-center gap-3 p-3 rounded-lg transition-all
                    ${isPageActive(item) ? "bg-blue-600 text-white shadow-lg" : "hover:bg-slate-50 text-slate-600"}
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

          <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Tools
          </div>

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

          <a
            href="https://github.com/Durgeshwar-AI/pdfToPng/issues"
            target="_blank"
            rel="noreferrer"
            className={`mt-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-900 px-4 py-3 text-white transition-all hover:shadow-lg ${isCollapsed ? "justify-center" : ""}`}
          >
            <Github className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-semibold">Report Issue</span>
            )}
          </a>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
