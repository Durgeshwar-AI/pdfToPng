import React, { useState } from 'react';
import ToolCard from './ToolCard';
import tools from '../../data/toolsData';
import { Sparkles } from 'lucide-react';

const ToolsGrid = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = tools.filter(tool => {
    const query = searchQuery
      .toLowerCase()
      .trim()
      .replace(/[-_\s]+/g, '');

    const toolName = tool.name.toLowerCase().replace(/[-_\s]+/g, '');

    const toolDescription = tool.description.toLowerCase().replace(/[-_\s]+/g, '');

    return toolName.includes(query) || toolDescription.includes(query);
  });

  return (
    <section id="tools" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-16 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2">
          <Sparkles className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-700">Professional Tools</span>
        </div>
        <h2 className="mb-4 text-4xl font-extrabold text-slate-900 md:text-5xl">
          Everything You Need
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Choose from our suite of powerful, privacy-first conversion tools
        </p>
      </div>

      <div className="mx-auto mb-10 max-w-md">
        <input
          type="text"
          aria-label="Search converters and tools"
          placeholder="Search converters and tools..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-orange-400 focus:outline-none"
        />
      </div>

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-2 items-stretch gap-6 lg:grid-cols-4">
          {filteredTools.map((tool, idx) => (
            <ToolCard key={tool.id} tool={tool} index={idx} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-lg text-slate-500">No tools found</p>
        </div>
      )}
    </section>
  );
};

export default ToolsGrid;
