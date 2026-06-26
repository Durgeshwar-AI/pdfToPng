import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, X, ChevronLeft, ChevronRight } from 'lucide-react';
import tools from '../../data/toolsData';

const Sidebar = ({ activeTab, isMobileMenuOpen, isMobile, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const filteredTools = tools.filter(tool => {
    const query = searchQuery
      .toLowerCase()
      .trim()
      .replace(/[-_\s]+/g, '');

    const toolName = tool.name.toLowerCase().replace(/[-_\s]+/g, '');

    const toolDescription = tool.description.toLowerCase().replace(/[-_\s]+/g, '');

    return toolName.includes(query) || toolDescription.includes(query);
  });

  const menuItems = filteredTools.map(t => ({
    id: t.id,
    label: t.name,
    icon: t.icon, // Pass the raw icon, handle cloning during render
    description: t.description,
    category: t.category || 'Utilities', // Default to an existing category
  }));

  const groupedTools = menuItems.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {});

  const categoryOrder = ['PDF Tools', 'Image Tools', 'AI Tools', 'Conversion Tools', 'Utilities'];

  // Base the empty state on visible categories, not total items
  const visibleCategories = categoryOrder.filter(category => groupedTools[category]);

  const handleNavigation = id => {
    navigate(`/${id}`);
    if (isMobile) onClose();
  };

  return (
    <>
      {/* Mobile overlay backdrop with high z-index */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={` ${isMobile ? 'fixed' : 'sticky'} top-0 left-0 z-[10000] h-screen bg-white text-blue-500 transition-all duration-300 ease-in-out dark:bg-gray-900 dark:text-gray-200 ${isMobile && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'} ${!isMobile && isCollapsed ? 'w-20' : 'w-80'} flex flex-col shadow-2xl`}
      >
        <div className="border-b border-slate-200 p-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {(!isCollapsed || isMobile) && (
              <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                <FileText className="h-6 w-6 text-blue-400" />
                <h1 className="text-xl font-bold">pdfToPng</h1>
              </Link>
            )}
            <button
              onClick={isMobile ? onClose : toggleSidebar}
              aria-label={
                isMobile ? 'Close sidebar' : isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
              }
              className={`rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-gray-800 ${
                isCollapsed && !isMobile ? 'mx-auto' : ''
              }`}
            >
              {isMobile ? (
                <X className="h-5 w-5" />
              ) : isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {!isCollapsed && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          )}

          {/* Condition updated to check visibleCategories instead of menuItems */}
          {visibleCategories.length > 0 ? (
            visibleCategories.map(category => {
              const items = groupedTools[category];

              return (
                <div key={category} className="mb-6">
                  {!isCollapsed && (
                    <h3 className="mb-2 px-2 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-gray-500">
                      {category}
                    </h3>
                  )}

                  <ul className="space-y-2">
                    {items.map(item => (
                      <li key={item.id}>
                        <button
                          onClick={() => handleNavigation(item.id)}
                          className={`flex w-full ${
                            isCollapsed ? 'flex-col' : 'flex-row'
                          } items-center gap-3 rounded-lg p-3 transition-colors ${
                            activeTab === item.id
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'text-slate-600 hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-gray-800'
                          } ${isCollapsed ? 'justify-center' : ''} `}
                          title={isCollapsed ? item.label : ''}
                        >
                          <span className="flex-shrink-0">
                            {/* Safely render the icon whether it's an element or component */}
                            {typeof item.icon === 'function' ? (
                              <item.icon className="h-5 w-5" />
                            ) : React.isValidElement(item.icon) ? (
                              React.cloneElement(item.icon, { className: 'w-5 h-5' })
                            ) : null}
                          </span>

                          {!isCollapsed && (
                            <div className="flex-1 text-left">
                              <div className="font-medium">{item.label}</div>
                              <div className="mt-0.5 text-xs opacity-75">{item.description}</div>
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
            <div className="py-4 text-center text-slate-500 dark:text-gray-400">No tools found</div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
