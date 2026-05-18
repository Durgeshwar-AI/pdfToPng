import React from "react";
import ToolCard from "./ToolCard";
import { FileText, Image, FileImage, Eraser, RotateCcw, Sliders, Gauge, Info, Sparkles } from "lucide-react";

const tools = [
  {
    id: "pdf-to-png",
    name: "PDF to PNG",
    icon: <FileText className="w-8 h-8" />,
    description:
      "Convert single-page PDF documents into high-quality PNG images instantly.",
    path: "/pdf-to-png",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconGradient: "from-amber-500 to-orange-500",
  },
  {
    id: "image-to-webp",
    name: "Image to WebP",
    icon: <Image className="w-8 h-8" />,
    description:
      "Optimize your images for the web by converting them to the modern WebP format.",
    path: "/image-to-webp",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconGradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "image-to-jpg",
    name: "Image to JPG",
    icon: <FileImage className="w-8 h-8" />,
    description:
      "Standardize your image formats by converting PNGs, WebPs, and more to JPG.",
    path: "/image-to-jpg",
    gradient: "from-blue-500/10 to-indigo-500/10",
    iconGradient: "from-blue-500 to-indigo-500",
  },
  {
    id: "remove-bg",
    name: "Remove Background",
    icon: <Eraser className="w-8 h-8" />,
    description:
      "Extract subjects from their backgrounds instantly with AI-powered processing.",
    path: "/remove-bg",
    gradient: "from-purple-500/10 to-pink-500/10",
    iconGradient: "from-purple-500 to-pink-500",
  },
  {
    id: "rotate-flip",
    name: "Rotate & Flip",
    icon: <RotateCcw className="w-8 h-8" />,
    description: "Rotate or flip images quickly with lossless transforms.",
    path: "/rotate-flip",
    gradient: "from-indigo-500/10 to-violet-500/10",
    iconGradient: "from-indigo-500 to-violet-500",
  },
  {
    id: "image-compress",
    name: "Image Compressor",
    icon: <Sliders className="w-8 h-8" />,
    description:
      "Reduce image size with adjustable quality settings — runs locally or transiently on the server.",
    path: "/image-compress",
    gradient: "from-rose-500/10 to-pink-500/10",
    iconGradient: "from-rose-500 to-pink-500",
  },
  {
    id: "image-dpi",
    name: "Image DPI Converter",
    icon: <Gauge className="w-8 h-8" />,
    description:
      "Change the DPI of your images for print-ready output. Supports JPEG, PNG, TIFF, BMP and WebP.",
    path: "/image-dpi",
    gradient: "from-cyan-500/10 to-sky-500/10",
    iconGradient: "from-cyan-500 to-sky-500",
  },
  {
    id: "image-metadata",
    name: "Metadata Viewer",
    icon: <Info className="w-8 h-8" />,
    description:
      "View, copy and strip hidden EXIF metadata from your images to protect your privacy.",
    path: "/image-metadata",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconGradient: "from-violet-500 to-purple-500",
  },
];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool, idx) => (
          <ToolCard key={tool.id} tool={tool} index={idx} />
        ))}
      </div>
    </section>
  );
};

export default ToolsGrid;
