const Card = ({ children, title, icon: Icon, className = '', footer }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full ${className}`}>
    {(title || Icon) && (
      <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
        {Icon && <Icon className="text-blue-600" size={20} />}
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>
    )}
    <div className="p-6 flex-grow">
      {children}
    </div>
    {footer && (
      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
        {footer}
      </div>
    )}
  </div>
);

export default Card;