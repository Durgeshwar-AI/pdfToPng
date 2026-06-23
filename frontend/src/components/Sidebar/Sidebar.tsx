import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FileText, X, ChevronLeft, ChevronRight } from "lucide-react";
import tools from "../../data/toolsData";

const Sidebar = ({ activeTab, isMobileMenuOpen, isMobile, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
   
  const navigate = useNavigate();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
 
  const filteredTools = tools.filter((tool) => {
    const query = searchQuery
      .toLowerCase()
      .trim()
      .replace(/[-_\s]+/g, "");

    const toolName = tool.name
      .toLowerCase()
      .replace(/[-_\s]+/g, "");

    const toolDescription = tool.description
      .toLowerCase()
      .replace(/[-_\s]+/g, "");

    return (
      toolName.includes(query) ||
      toolDescription.includes(query)
    );
  });

  const menuItems = filteredTools.map((t) => ({
    id: t.id,
    label: t.name,
    icon: t.icon, // Pass the raw icon, handle cloning during render
    description: t.description,
    category: t.category || "Utilities", // Default to an existing category
  }));

  const groupedTools = menuItems.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {});

  const categoryOrder = [
    "PDF Tools",
    "Image Tools",
    "AI Tools",
    "Conversion Tools",
    "Utilities",
  ];

  // Base the empty state on visible categories, not total items
  const visibleCategories = categoryOrder.filter((category) => groupedTools[category]);

  const handleNavigation = (id) => {
    navigate(`/${id}`);
    if (isMobile) onClose();
  };

  return (
    <>
      {/* Mobile overlay backdrop with high z-index */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`
          ${isMobile ? "fixed" : "sticky"} 
          top-0 left-0 h-screen bg-white dark:bg-gray-900
          text-blue-500 dark:text-gray-200 transition-all duration-300 ease-in-out z-[10000]
          ${isMobile && !isMobileMenuOpen ? "-translate-x-full" : "translate-x-0"}
          ${!isMobile && isCollapsed ? "w-20" : "w-80"}
          flex flex-col shadow-2xl
        `}
      >
        <div className="p-4 border-b border-slate-200 dark:border-gray-700">
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
              aria-label={
                isMobile
                  ? "Close sidebar"
                  : isCollapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
              className={`p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${
                isCollapsed && !isMobile ? "mx-auto" : ""
              }`}
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
          {!isCollapsed && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          )}

          {/* Condition updated to check visibleCategories instead of menuItems */}
          {visibleCategories.length > 0 ? (
            visibleCategories.map((category) => {
              const items = groupedTools[category];

              return (
                <div key={category} className="mb-6">
                  {!isCollapsed && (
                    <h3 className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                      {category}
                    </h3>
                  )}

                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => handleNavigation(item.id)}
                          className={`
                            w-full flex ${
                              isCollapsed ? "flex-col" : "flex-row"
                            } items-center gap-3 p-3 rounded-lg transition-colors
                            ${
                              activeTab === item.id
                                ? "bg-blue-600 text-white shadow-lg"
                                : "hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-300"
                            }
                            ${isCollapsed ? "justify-center" : ""}
                          `}
                          title={isCollapsed ? item.label : ""}
                        >
                          <span className="flex-shrink-0">
                            {/* Safely render the icon whether it's an element or component */}
                            {typeof item.icon === "function" ? (
                              <item.icon className="w-5 h-5" />
                            ) : React.isValidElement(item.icon) ? (
                              React.cloneElement(item.icon, { className: "w-5 h-5" })
                            ) : null}
                          </span>

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
                </div>
              ); 
            })
          ) : (
            <div className="text-center text-slate-500 dark:text-gray-400 py-4">
              No tools found
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
