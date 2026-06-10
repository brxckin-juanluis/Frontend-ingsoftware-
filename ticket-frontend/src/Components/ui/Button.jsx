import { Loader2 } from 'lucide-react';

const Button = ({ children, variant = 'primary', className = '', loading = false, ...props }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30',
    secondary: 'bg-slate-800 hover:bg-slate-900 text-white shadow-lg shadow-slate-500/20',
    outline: 'border-2 border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ai: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl shadow-purple-500/20',
  };

  return (
    <button 
      className={`px-4 py-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : children}
    </button>
  );
};

export default Button;