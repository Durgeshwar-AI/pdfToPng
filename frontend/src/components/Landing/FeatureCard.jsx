const FeatureCard = ({ icon, title, description, gradient, index }) => (
  <div
    className=" group relative p-8 rounded-2xl bg-white shadow-sm border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
    style={{ animationDelay: `${800 + index * 100}ms` }}
  >
    <div
      className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10"
      style={{
        background: `linear-gradient(135deg, ${gradient.split(" ")[1]}, transparent)`,
      }}
    />

    <div
      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} p-[1px] mb-6`}
    >
      <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
        {icon}
      </div>
    </div>

    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
  </div>
);

export default FeatureCard;