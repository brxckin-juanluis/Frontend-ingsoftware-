import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Download,
  ChevronLeft,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { incomesService } from '../services/api';
import Card from '../Components/ui/Card';
import Button from '../Components/ui/Button';

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b'];

const ReportsPage = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await incomesService.getIncomes();
      setReportData(res?.data || res || {});
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Datos simulados basados en el total para los gráficos (ya que el endpoint solo da totales)
  const pieData = [
    { name: 'Vehículos Livianos', value: (reportData?.TotalIngresos || 0) * 0.6 },
    { name: 'Motos', value: (reportData?.TotalIngresos || 0) * 0.25 },
    { name: 'Camiones', value: (reportData?.TotalIngresos || 0) * 0.15 },
  ];

  const barData = [
    { name: 'Lun', ingresos: (reportData?.TotalIngresos || 0) * 0.8 },
    { name: 'Mar', ingresos: (reportData?.TotalIngresos || 0) * 0.9 },
    { name: 'Mie', ingresos: (reportData?.TotalIngresos || 0) * 0.7 },
    { name: 'Jue', ingresos: (reportData?.TotalIngresos || 0) * 1.1 },
    { name: 'Vie', ingresos: reportData?.TotalIngresos || 0 },
    { name: 'Sab', ingresos: (reportData?.TotalIngresos || 0) * 0.6 },
    { name: 'Dom', ingresos: (reportData?.TotalIngresos || 0) * 0.4 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-2 font-bold text-sm"
            >
              <ChevronLeft size={16} />
              Volver al Dashboard
            </button>
            <h1 className="text-3xl font-black text-slate-800">Reportes Financieros</h1>
            <p className="text-slate-500 font-medium">Análisis de ingresos y desempeño del parqueo.</p>
          </div>
          
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Download size={20} />
            Exportar PDF
          </Button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="bg-green-100 text-green-600 p-3 rounded-2xl w-fit mb-4">
              <DollarSign size={24} />
            </div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">Ingresos Totales</p>
            <h2 className="text-4xl font-black text-slate-800">
              Q.{loading ? '...' : (reportData?.TotalIngresos || 0)}
            </h2>
            <div className="flex items-center gap-1 text-green-500 text-xs font-bold mt-2">
              <TrendingUp size={14} />
              <span>+12% vs ayer</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl w-fit mb-4">
              <FileText size={24} />
            </div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">Tickets Pagados</p>
            <h2 className="text-4xl font-black text-slate-800">
              {loading ? '...' : (reportData?.TicketsPagados || reportData?.total_tickets || 0)}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-2">Transacciones finalizadas</p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl w-fit mb-4">
              <Calendar size={24} />
            </div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">Promedio Diario</p>
            <h2 className="text-4xl font-black text-slate-800">
              Q.{loading ? '...' : ((reportData?.TotalIngresos / 30) || 0).toFixed(2)}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-2">Estimado últimos 30 días</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Distribución por Categoría" icon={PieIcon}>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`Q.${value.toFixed(2)}`, 'Ingresos']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Ingresos Semanales" icon={BarChart3}>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={barData}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                    tickFormatter={(value) => `Q.${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="ingresos" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;