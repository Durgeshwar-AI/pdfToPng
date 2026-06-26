const FeatureCard = ({ icon, title, description, gradient, index }) => (
  <div
    className="group animate-fade-in-up relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-slate-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
    style={{ animationDelay: `${800 + index * 100}ms` }}
  >
    <div
      className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-10"
      style={{
        background: `linear-gradient(135deg, ${gradient.split(' ')[1]}, transparent)`,
      }}
    />

    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${gradient} mb-6 p-[1px]`}>
      <div className="flex h-full w-full items-center justify-center rounded-xl bg-white dark:bg-slate-800">
        {icon}
      </div>
    </div>

    <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">{title}</h3>

    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>
  </div>
);

export default FeatureCard;
