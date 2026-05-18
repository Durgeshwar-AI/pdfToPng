import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const ToolCard = ({ tool, index }) => (
  <Link
    to={tool.path}
    className="group relative p-8 rounded-2xl bg-white shadow-sm border border-slate-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-slate-300 animate-fade-in-up flex flex-col"
    style={{ animationDelay: `${1000 + index * 100}ms` }}
  >
    <div
      className={`absolute inset-0 rounded-2xl bg-linear-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
    />

    <div
      className={`w-14 h-14 rounded-xl bg-linear-to-br ${tool.iconGradient} p-px mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}
    >
      <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
        {React.cloneElement(tool.icon, { className: "w-7 h-7 text-slate-800" })}
      </div>
    </div>

    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-slate-900 group-hover:to-blue-700 group-hover:bg-clip-text transition-all duration-300">
      {tool.name}
    </h3>
    <p className="text-slate-600 text-sm leading-relaxed flex-1">
      {tool.description}
    </p>

    <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
      <ArrowRight className="w-6 h-6 text-blue-600" />
    </div>
  </Link>
);

export default ToolCard;