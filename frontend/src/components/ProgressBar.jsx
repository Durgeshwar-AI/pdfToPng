const ProgressBar = ({ progress, statusMessage, statusType = "processing" }) => {
  const barColor =
    statusType === "success"
      ? "from-green-500 to-emerald-500"
      : statusType === "failed" || statusType === "error"
      ? "from-red-500 to-rose-500"
      : "from-[#4361ee] to-[#3b82f6]";

  const textColor =
    statusType === "success"
      ? "text-green-600"
      : statusType === "failed" || statusType === "error"
      ? "text-red-500"
      : "text-[#4b5563]";

  const isActive = statusType === "processing";

  return (
    <div className="w-full max-w-[500px] mx-auto mt-6">
      <div className="h-3 rounded-full bg-gray-200 overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500 ease-out ${
            isActive ? "animate-pulse" : ""
          }`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className={`text-sm font-medium ${textColor}`}>
          {statusMessage || "Processing..."}
        </p>
        <span className="text-xs font-bold text-gray-400">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
