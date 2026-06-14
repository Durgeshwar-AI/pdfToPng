import React from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";

const DependencyWarning = ({ dependencies = [], status = "ok" }) => {
  if (status !== "degraded" || dependencies.length === 0) {
    return null;
  }

  const labels = dependencies.map((item) => item.name).join(", ");

  return (
    <div className="w-full max-w-[960px] mx-auto px-4 pt-4">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div className="min-w-0 flex-1 text-sm leading-relaxed">
          <p className="font-semibold">
            Some server dependencies are missing or unavailable.
          </p>
          <p className="mt-1 text-amber-800 dark:text-amber-200">
            {labels} may be unavailable until the server image includes the
            required packages.
          </p>
          <a
            href="https://github.com/Durgeshwar-AI/pdfToPng#manual-dependency-installation"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 font-semibold text-amber-900 underline-offset-4 hover:underline dark:text-amber-100"
          >
            Learn how to fix this
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DependencyWarning;
