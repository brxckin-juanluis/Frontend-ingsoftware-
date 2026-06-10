import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  DollarSign,
  LogOut, 
  Sparkles, 
  ShieldAlert,
  Car,
  ChevronRight,
  AlertCircle,
  Printer,
  X
} from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { incomesService, spaceService, ticketService, getUserInfo, typeService, paymentService } from '../services/api';
import { fetchGeminiText } from '../services/geminiService';
import Card from '../Components/ui/Card';
import Button from '../Components/ui/Button';
import Input from '../Components/ui/Input';
import Alert from  '../Components/ui/Alert';
import TicketPrint from '../Components/TicketPrint';
import { useReactToPrint } from 'react-to-print';

const DashboardPage = ({ onNavigate }) => {
  const { user, setUser, logout } = useAuth();
  const [stats, setStats] = useState({ ocupados: 0, libres: 0, recaudado: 0 });
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const isLoadingData = useRef(false);
  
  const [tickets, setTickets] = useState([]);
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Constante para alertas
  const [alert, setAlert] = useState({ show: false, message: '', type: ''});
  
  // Estado para creación de ticket
  const [newTicket, setNewTicket] = useState({ placa: '', idType: '1' });
  const [createLoading, setCreateLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState([]);

  // Estado para el modal del ticket generado
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [calculatedTotal, setCalculatedTotal] = useState(null);

  // Estado para cobro de ticket
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({ qrString: '', idPay: '', idType: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Filtros para ticktes
  const [newFilter, setNewFilter] = useState({qrCode: '',licensePlate:'',initialDate:'',finalDate:''});
  
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const loadDashboardData = async () => {
    if (isLoadingData.current) return;
    isLoadingData.current = true;
    setLoading(true);
    
    try {
      // 1. Consumo de endpoints en paralelo para mayor eficiencia
      const [dataSpaces, dataIncomes, dataUser, typesData, paymentsData] = await Promise.all([
        spaceService.getAvailables(1),
        incomesService.getIncomes(),
        getUserInfo.getInfo(),
        typeService.getAll({table: 'TIPO'}),
        paymentService.getAll()
      ]);

      if (!isMounted.current) return;

      setVehicleTypes(typesData?.data || typesData || []);
      setPaymentMethods(paymentsData?.data || paymentsData || []);
      
      const disponibles = dataSpaces?.data?.espaciosDisponibles || 0;
      const totalCapacidad = 100;
      const ingresos = dataIncomes?.data?.TotalIngresos || 0;
      
      const userData = dataUser?.data || dataUser?.user || dataUser;
      const username = userData?.username || user?.username;
      const rolUser = userData?.role || userData?.rol || user?.role;

      // Actualizamos el usuario global si tenemos info nueva (ej: el idUser)
      if (userData && (userData.idUser || userData.id) && !user?.idUser) {
        setUser(prev => ({ ...prev, ...userData }));
      }

      setStats(prev => ({
        ...prev,
        libres: disponibles,
        ocupados: totalCapacidad - disponibles,
        recaudado: ingresos,
        user: username,
        role: rolUser
      }));

      // 2. Cargar tickets
      const ticketsData = await ticketService.getToday();
      let ticketsList = [];
      
      if (Array.isArray(ticketsData)) {
        ticketsList = ticketsData;
      } else if (ticketsData && Array.isArray(ticketsData.data)) {
        ticketsList = ticketsData.data;
      } else if (ticketsData && typeof ticketsData === 'object') {
        const possibleArray = Object.values(ticketsData).find(val => Array.isArray(val));
        if (possibleArray) ticketsList = possibleArray;
      }

      console.log(`[Dashboard] Tickets cargados:`, ticketsList);
      setTickets([...ticketsList].slice(0, 10));

    } catch (err) {
      console.error("Error cargando datos del servidor:", err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        isLoadingData.current = false;
      }
    }
  };
  const fetchTotal = async () => {
    if (paymentData.qrString && paymentData.idType && paymentData.idPay) {
      try {
        const response = await ticketService.amount({
          qrString: paymentData.qrString,
          idType: paymentData.idType,
          idPay: paymentData.idPay
        });

        if (response.result) {
          setCalculatedTotal(response.total);
        }
      } catch (err) {
        console.error("Error calculando total:", err);
      }
    }
  };

// Usamos un useEffect para disparar el cálculo cuando cambien los inputs del modal
// 1. Efecto para la carga inicial del Dashboard
useEffect(() => {
  isMounted.current = true;
  if (user && !isLoadingData.current) {
    loadDashboardData();
  }
  return () => { isMounted.current = false; };
}, [user]); // Solo se dispara cuando el usuario cambia

// 2. Efecto para el cálculo del pago (Solo se dispara si el modal está abierto)
useEffect(() => {
  if (showPaymentModal) {
    fetchTotal();
  }
}, [paymentData.idType, paymentData.idPay, paymentData.qrString, showPaymentModal]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    console.log(newTicket);
    if (!newTicket.placa || !newTicket.idType) {
      setAlert({ show: true, message: 'Por favor ingrese la placa y un tipo de vehiculo', type: 'error' });
      return;
    }
    
    setCreateLoading(true);
    try {
      // El backend requiere idPay (idType en el servicio) e idUser
      const response = await ticketService.create({ 
        licensePlate: newTicket.placa,
        idPay: parseInt(newTicket.idType),
        idUser: user?.idUser || user?.id || 1
      });

      if (response.result) {
        const ticketInfo = {
          placa: newTicket.placa,
          qrString: response.qrString,
          fechaEntrada: new Date().toISOString()
        };
        
        setGeneratedTicket(ticketInfo);
        setShowTicketModal(true);
        setNewTicket({ placa: '', idType: '1', qrString: '' });
        await loadDashboardData();
      }
    } catch (err) {
      setAlert({ show: true, message: `Error al crear ticket: ${err.message}`, type: 'error' });
    } finally {
      setCreateLoading(false);
    }
  };

 const handleFilterSearch = async (e) => {
  e?.preventDefault();
  setLoading(true);
  try {
    const response = await ticketService.filter(newFilter);
    
    // Si la respuesta es el array directo, úsalo. Si viene en una propiedad .data, úsala.
    const dataToSet = Array.isArray(response) ? response : (response.data || []);
    console.log(dataToSet);
    setTickets(dataToSet);
    
  } catch (err) {
    console.error("Error al filtrar:", err);
  } finally {
    setLoading(false);
  }
};

const cleanFilters = () => {
  setNewFilter({ qrCode: '', licensePlate: '', initialDate: '', finalDate: '' });
  loadDashboardData();
}

  const handleAiInsight = async () => {
    setAiLoading(true);
    try {
      const prompt = `Como analista de datos de un parqueo, analiza estos datos actuales:
      - Espacios libres: ${stats.libres}
      - Espacios ocupados: ${stats.ocupados}
      - Capacidad total: 100
      - Recaudado hoy: $${stats.recaudado}
      Genera un breve consejo estratégico (máximo 2 frases) para mejorar la eficiencia.`;
      
      const insight = await fetchGeminiText(prompt);
      setAiInsight(insight);
    } catch (err) {
      setAiInsight("No se pudo obtener el análisis en este momento.");
    } finally {
      setAiLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentData.qrString || !paymentData.idPay || !paymentData.idType) {
      setAlert({ show: true, message: 'Por favor complete todos los campos para procesar el pago', type: 'error' });
      return;
    }

    setPaymentLoading(true);
    try {
      const response = await ticketService.update({
        qrString: paymentData.qrString,
        idUser: user?.idUser || user?.id || 1,
        idPay: parseInt(paymentData.idPay),   // Plan (Hora, Día, etc.)
        idType: parseInt(paymentData.idType)  // Tipo de Vehículo
      });

      if (response.result) {
        setAlert({ show: true, message: `Pago procesado, total: ${response.total}`, type: 'success' });
        setShowPaymentModal(false);
        setPaymentData({ qrString: '', idPay: '', idType: '' });
        await loadDashboardData();
        console.log(tickets);
      }
    } catch (err) {
      setAlert({ show: true, message: `Error al procesar el cobro: ${err.message}`, type: 'error' });
    } finally {
      setPaymentLoading(false);
    }
  };

  //Funcion para abrir el model de cobro con los datos Colocados directamente.
  const preparePayment = (ticket) => {
  // Construimos el código QR esperado, ajustado a tu formato
  const qrString = `IS-${ticket.idTicket}-GP3`;
  
  // Prellenamos el estado del modal
  setPaymentData({ 
    ...paymentData, 
    qrString: qrString 
  });
  
  // Abrimos el modal
  setShowPaymentModal(true);
};

  const handleSecurityReport = async () => {
    alert("Analizando situación de seguridad con IA...");
    try {
      const prompt = `Como jefe de seguridad de un parqueo, analiza estos datos:
      - Espacios ocupados: ${stats.ocupados}
      - Recaudación actual: Q.${stats.recaudado}
      Genera un breve reporte de seguridad (2 frases) sobre posibles riesgos o medidas de control necesarias para el turno actual.`;
      
      const report = await fetchGeminiText(prompt);
      alert("REPORTE DE SEGURIDAD IA:\n\n" + report);
    } catch (err) {
      alert("No se pudo generar el reporte de seguridad en este momento.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Car className="text-white" size={20} />
          </div>
          <span className="font-black text-xl text-slate-800">SmartParking</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 border-r border-slate-200 pr-6 mr-2">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="text-sm font-bold text-blue-600 px-3 py-2 bg-blue-50 rounded-xl"
            >
              Dashboard
            </button>
            <button 
              onClick={() => onNavigate('catalogs')}
              className="text-sm font-bold text-slate-500 hover:text-blue-600 px-3 py-2 transition-colors"
            >
              Catálogos
            </button>
            <button 
              onClick={() => onNavigate('reports')}
              className="text-sm font-bold text-slate-500 hover:text-blue-600 px-3 py-2 transition-colors"
            >
              Reportes
            </button>
          </div>

          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-800">{stats.user || 'Usuario'}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{stats.role}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>
      
      <main className="p-6 max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-800">Panel de Control</h1>
          <p className="text-slate-500 font-medium">Visualización de datos en tiempo real y análisis con IA.</p>
        </header>

        {/* Sección de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card title="Espacios Libres" icon={LayoutDashboard}>
            {loading ? (
              <div className="animate-pulse h-10 w-20 bg-slate-200 rounded"></div>
            ) : (
              <p className="text-4xl font-black text-slate-800">{stats.libres}</p>
            )}
            <p className="text-xs text-slate-500 mt-2 font-medium">Datos en tiempo real (SQL)</p>
          </Card>

          <Card title="Ocupados" icon={Clock}>
            {loading ? (
              <div className="animate-pulse h-10 w-20 bg-slate-200 rounded"></div>
            ) : (
              <p className="text-4xl font-black text-slate-800">{stats.ocupados}</p>
            )}
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {loading ? 'Calculando...' : `${Math.round((stats.ocupados / (stats.ocupados + stats.libres + 1)) * 100)}% Capacidad`}
            </p>
          </Card>

          <Card title="Recaudación" icon={DollarSign}>
            {loading ? (
              <div className="animate-pulse h-10 w-20 bg-slate-200 rounded"></div>
            ) : (
              <p className="text-4xl font-black text-green-600">Q.{stats.recaudado}</p>
            )}
            <p className="text-xs text-slate-500 mt-2 font-medium">Total acumulado hoy</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal: Tickets */}
          <div className="lg:col-span-2">
            <Card title="Gestión de Tickets" icon={ChevronRight}>
              {/* Barra de Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                <Input 
                  placeholder="QR Code" 
                  value={newFilter.qrCode.toUpperCase()}
                  onChange={(e) => setNewFilter({...newFilter, qrCode: e.target.value})}
                />
                <Input 
                  placeholder="Placa" 
                  value={newFilter.licensePlate.toUpperCase()}
                  onChange={(e) => setNewFilter({...newFilter, licensePlate: e.target.value})}
                />
                <Input 
                  type="date" 
                  value={newFilter.initialDate}
                  onChange={(e) => setNewFilter({...newFilter, initialDate: e.target.value})}
                />
                <Input
                  type="date"
                  value={newFilter.finalDate}
                  onChange={(e) => setNewFilter({...newFilter, finalDate: e.target.value})}
                />
                <Button onClick={handleFilterSearch} className="w-full">
                  Buscar
                </Button>
                <Button onClick={cleanFilters} className="w-full">
                  Limpiar Filtros
                </Button>
              </div>

              {/* Cambia esta parte en tu renderizado */}
              {loading ? (
                <div className="space-y-4">Cargando...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    {/* ... dentro de tu tabla ... */}
                    <thead>
                      <tr className="text-slate-400 text-sm uppercase tracking-wider">
                        <th className="pb-4 font-bold">Placa</th>
                        <th className="pb-4 font-bold">Entrada</th>
                        <th className="pb-4 font-bold">Estado</th>
                        <th className="pb-4 font-bold">Código</th>
                        <th className="pb-4 font-bold">Acción</th> {/* Nueva columna */}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {tickets.map((ticket, index) => (
                        <tr key={`${ticket.idTicket}-${index}`} className="text-slate-700">
                          <td className="py-3 font-bold">{ticket.placaVehiculo}</td>
                          <td className="py-3">
                            {ticket.horaEntrada ? new Date(ticket.horaEntrada).toLocaleTimeString(['es-GT'], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                              timeZone: 'UTC'
                            }) : '---'}
                          </td>
                          <td className="py-3">
                            {ticket.pagado && !ticket.statusTicket ? (
                              <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-300 text-black-700">
                                Pagado
                              </span>
                            ): (
                              <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                                Activo
                            </span>
                            )}
                          </td>
                          <td className='py-3'>IS-{ticket.idTicket}-GP3</td>
                          <td className="py-3">
                            {/* Botón que dispara la función de preparar pago */}
                            <button 
                              onClick={() => preparePayment(ticket)}
                              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <DollarSign size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Columna lateral: IA y Acciones */}
          <div className="flex flex-col gap-6">
            <Card title="Emitir Ticket" icon={Car}>
              <form onSubmit={handleCreateTicket} className="flex flex-col gap-4">
                <Input 
                  placeholder="Número de Placa" 
                  icon={Car}
                  value={newTicket.placa}
                  // Solo actualizamos la placa. idType se mantiene '1' automáticamente por el estado inicial.
                  onChange={(e) => setNewTicket(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  loading={createLoading}
                >
                  Registrar Entrada
                </Button>
              </form>
            </Card>

            <Card title="Acciones de Seguridad" icon={ShieldAlert}>
              <div className="flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-sm border-blue-200 text-blue-700 hover:bg-blue-50" 
                  onClick={() => setShowPaymentModal(true)}
                >
                  <DollarSign size={16} />
                  Cobrar Ticket (Salida)
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" onClick={handleSecurityReport}>
                  <AlertCircle size={16} />
                  Generar Reporte de Incidencias
                </Button>
                <Button variant="secondary" className="w-full justify-start text-sm" onClick={() => window.print()}>
                  Descargar Resumen PDF
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Modal de Cobro/Salida */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800">Procesar Salida</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handlePayment} className="p-6 flex flex-col gap-4">
              <Input 
                placeholder="Código QR (ej: IS-10-GP3)" 
                icon={ChevronRight}
                value={paymentData.qrString}
                onChange={(e) => setPaymentData({ ...paymentData, qrString: e.target.value })}
                required
              />

              <div className="relative">
                <select
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl block p-3 appearance-none font-medium"
                  value={paymentData.idType}
                  onChange={(e) => setPaymentData({ ...paymentData, idType: e.target.value })}
                  required
                >
                  <option value="">Tipo de Vehículo</option>
                  {vehicleTypes.map((type) => (
                    <option key={type.idType || type.id || type.idTipo} value={type.idType || type.id || type.idTipo}>
                      {type.nombreTipo || type.descripcion || type.name || 'Tipo ' + (type.idType || type.id || type.idTipo)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
              </div>

              <div className="relative">
                <select
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl block p-3 appearance-none font-medium"
                  value={paymentData.idPay}
                  onChange={(e) => setPaymentData({ ...paymentData, idPay: e.target.value })}
                  required
                >
                  <option value="">Plan de Cobro</option>
                  <option value="1">HORA</option>
                  <option value="2">MEDIA HORA</option>
                  <option value="3">DIA</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
              </div>
              {calculatedTotal !== null && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex justify-between items-center my-2">
                  <span className="text-green-700 font-bold text-sm">Total a cobrar:</span>
                  <span className="text-green-800 font-black text-xl">Q.{calculatedTotal}</span>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="flex-1" 
                  loading={paymentLoading}
                >
                  Confirmar Pago
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Ticket Generado */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800">Ticket Generado</h3>
              <button 
                onClick={() => setShowTicketModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 bg-slate-50">
              <div className="bg-white shadow-sm rounded-xl overflow-hidden">
                <TicketPrint ref={componentRef} ticketData={generatedTicket} />
              </div>
            </div>

            <div className="p-6 bg-white flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setShowTicketModal(false)}
              >
                Cerrar
              </Button>
              <Button 
                className="flex-1 gap-2" 
                onClick={handlePrint}
              >
                <Printer size={18} />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      )}
      {alert.show && (
        <Alert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert({ ...alert, show: false })} 
        />
      )}
    </div>
  );
};

export default DashboardPage;