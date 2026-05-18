import React from "react";
import FeatureCard from "./FeatureCard";
import { Lock, Zap, HardDrive } from "lucide-react";

const features = [
  {
    icon: <Lock className="w-7 h-7 text-blue-600" />,
    title: "100% Private",
    description:
      "Privacy-first: files are not persistently stored. Processing happens locally when possible; any server-side work is transient and never retained.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: <Zap className="w-7 h-7 text-orange-500" />,
    title: "Lightning Fast",
    description: "Instant conversions with no waiting for uploads or downloads",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: <HardDrive className="w-7 h-7 text-teal-500" />,
    title: "No Storage Limits",
    description: "We do not persist user files — no data storage at any cost.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const FeatureSection = () => {
  return (
    <section id="feature" className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid mt-10 grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <FeatureCard key={idx} {...feature} index={idx} />
        ))}
      </div>
    </section>
  );
};

export default FeatureSection;
