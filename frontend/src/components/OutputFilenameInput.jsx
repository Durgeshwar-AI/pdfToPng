import { sanitizeFilenameInput } from "../utils/fileNames";

const OutputFilenameInput = ({
  value,
  onChange,
  label = "Output filename",
  placeholder,
  className = "",
}) => (
  <div className={`w-full mb-5 text-left ${className}`}>
    <label className="block mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#64748b]">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(sanitizeFilenameInput(e.target.value))}
      placeholder={placeholder}
      spellCheck={false}
      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1a1a2e] outline-none transition focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15"
    />
  </div>
);

export default OutputFilenameInput;
