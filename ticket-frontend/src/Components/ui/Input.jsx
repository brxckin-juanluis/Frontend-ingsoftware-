const Input = ({ label, icon: Icon, error, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}
    <div className="relative group">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input 
        className={`w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2.5 ${Icon ? 'pl-10' : 'px-4'} pr-4 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700`}
        {...props}
      />
    </div>
    {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
  </div>
);

export default Input;