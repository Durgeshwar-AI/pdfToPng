import React from "react";
import ToolCard from "./ToolCard";
import tools from "../../data/toolsData";
import { Sparkles } from "lucide-react";

const ToolsGrid = () => {
  return (
    <section id="tools" className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 mb-6">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-700">
            Professional Tools
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-900">
          Everything You Need
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          Choose from our suite of powerful, privacy-first conversion tools
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {tools.map((tool, idx) => (
          <ToolCard key={tool.id} tool={tool} index={idx} />
        ))}
      </div>
    </section>
  );
};

export default ToolsGrid;
