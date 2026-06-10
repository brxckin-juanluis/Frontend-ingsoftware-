import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Settings, 
  Plus, 
  Trash2, 
  Tag, 
  Truck,
  Layers,
  Search,
  ChevronLeft
} from 'lucide-react';
import { brandService, typeService, modelService } from '../services/api';
import Card from '../Components/ui/Card';
import Button from '../Components/ui/Button';
import Input from '../Components/ui/Input';

const CatalogPage = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('brands');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Forms
  const [showForm, setShowForm] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '' });
  const [newType, setNewType] = useState({ description: '', rate: '' });
  const [newModel, setNewModel] = useState({ name: '', idBrand: '' });
  
  const [brandsList, setBrandsList] = useState([]); // For model creation

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'brands') {
        const res = await brandService.getAll();
        setData(res?.data?.brands || res?.brands || []);
      } else if (activeTab === 'types') {
        const res = await typeService.getAll();
        setData(res?.data || res || []);
      } else if (activeTab === 'models') {
        const res = await brandService.getAll(); // Catalog usually has all
        setData(res?.data?.models || res?.models || []);
        setBrandsList(res?.data?.brands || res?.brands || []);
      }
    } catch (err) {
      console.error("Error fetching catalog data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'brands') {
        await brandService.create(newBrand);
        setNewBrand({ name: '' });
      } else if (activeTab === 'types') {
        await typeService.create(newType);
        setNewType({ description: '', rate: '' });
      } else if (activeTab === 'models') {
        await modelService.create(newModel);
        setNewModel({ name: '', idBrand: '' });
      }
      setShowForm(false);
      fetchData();
      alert("Creado exitosamente");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    const text = (item.name || item.descripcion || item.description || '').toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

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
            <h1 className="text-3xl font-black text-slate-800">Administración de Catálogos</h1>
            <p className="text-slate-500 font-medium">Gestiona marcas, modelos y tipos de vehículos.</p>
          </div>
          
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus size={20} />
            Nuevo Registro
          </Button>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 bg-white p-1.5 rounded-2xl shadow-sm w-fit border border-slate-200">
          <button 
            onClick={() => setActiveTab('brands')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'brands' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Tag size={18} />
            Marcas
          </button>
          <button 
            onClick={() => setActiveTab('models')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'models' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Layers size={18} />
            Modelos
          </button>
          <button 
            onClick={() => setActiveTab('types')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'types' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Truck size={18} />
            Tipos
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content List */}
          <div className="lg:col-span-2">
            <Card title={`Lista de ${activeTab === 'brands' ? 'Marcas' : activeTab === 'models' ? 'Modelos' : 'Tipos'}`} icon={Search}>
              <div className="mb-6">
                <Input 
                  placeholder="Buscar..." 
                  icon={Search} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="animate-pulse h-16 bg-slate-50 rounded-2xl"></div>
                  ))}
                </div>
              ) : filteredData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredData.map((item, idx) => (
                    <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center group hover:border-blue-200 hover:shadow-md transition-all">
                      <div>
                        <p className="font-black text-slate-800">
                          {item.name || item.descripcion || item.description}
                        </p>
                        {activeTab === 'models' && item.brandName && (
                          <p className="text-xs text-slate-500 font-bold uppercase">{item.brandName}</p>
                        )}
                        {activeTab === 'types' && (
                          <p className="text-xs text-green-600 font-black">Tarifa: Q.{item.rate || item.tarifa || 0}</p>
                        )}
                      </div>
                      <button className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p className="font-medium">No se encontraron resultados.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Form Side */}
          <div>
            {showForm ? (
              <Card title="Nuevo Registro" icon={Plus} className="sticky top-24 border-blue-100 shadow-xl shadow-blue-50">
                <form onSubmit={handleCreate} className="flex flex-col gap-4">
                  {activeTab === 'brands' && (
                    <Input 
                      placeholder="Nombre de la Marca" 
                      value={newBrand.name}
                      onChange={(e) => setNewBrand({ name: e.target.value.toUpperCase() })}
                      required
                    />
                  )}

                  {activeTab === 'models' && (
                    <>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-blue-500"
                        value={newModel.idBrand}
                        onChange={(e) => setNewModel({ ...newModel, idBrand: e.target.value })}
                        required
                      >
                        <option value="">Seleccione Marca</option>
                        {brandsList.map(b => (
                          <option key={b.idBrand || b.id} value={b.idBrand || b.id}>{b.name}</option>
                        ))}
                      </select>
                      <Input 
                        placeholder="Nombre del Modelo" 
                        value={newModel.name}
                        onChange={(e) => setNewModel({ ...newModel, name: e.target.value.toUpperCase() })}
                        required
                      />
                    </>
                  )}

                  {activeTab === 'types' && (
                    <>
                      <Input 
                        placeholder="Descripción del Tipo" 
                        value={newType.description}
                        onChange={(e) => setNewType({ ...newType, description: e.target.value.toUpperCase() })}
                        required
                      />
                      <Input 
                        placeholder="Tarifa por hora (Q.)" 
                        type="number"
                        value={newType.rate}
                        onChange={(e) => setNewType({ ...newType, rate: e.target.value })}
                        required
                      />
                    </>
                  )}

                  <div className="flex gap-2 mt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowForm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      loading={loading}
                    >
                      Guardar
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-2xl shadow-blue-200">
                <Settings className="mb-4 opacity-50" size={40} />
                <h3 className="text-xl font-black mb-2">Configuración Rápida</h3>
                <p className="text-blue-100 text-sm font-medium leading-relaxed mb-6">
                  Mantén actualizado tu catálogo para asegurar que el registro de entradas sea preciso y eficiente.
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-blue-600 border-none hover:bg-blue-50"
                  onClick={() => setShowForm(true)}
                >
                  Agregar ahora
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;