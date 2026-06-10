import React, { useState } from 'react';
import { Car, User, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { authService } from '../services/api';
import Card from '../Components/ui/Card';
import Input from '../Components/ui/Input';
import Button from '../Components/ui/Button';

const LoginPage = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formato de usuario con regex
    const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
    if (!usernameRegex.test(formData.username)) {
      return setError('El usuario debe tener entre 3 y 16 caracteres (letras, números o guiones bajos)');
    }

    // Validar formato de contraseña con regex
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return setError('La contraseña debe tener al menos 8 caracteres, incluyendo letras y números');
    }

    setLoading(true);
    setError('');
    
    try {
      // Usamos el servicio real conectado a tu Backend
      const data = await authService.login(formData);
      
      // Intentamos extraer el token de varias posibles estructuras
      const token = data?.token || data?.data?.token || (typeof data === 'string' ? data : null);
      const user = data?.user || data?.data?.user || { username: formData.username };

      if (token) {
        login(token, user);
      } else {
        setError('No se recibió un token de acceso válido.');
      }
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/40">
            <Car className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">SmartParking</h1>
          <p className="text-slate-500 font-medium tracking-wide">Panel de Gestión de Ingeniería</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
            
            <Input 
              label="Usuario" 
              name="username"
              placeholder="Ej: srodas" 
              icon={User} 
              required 
              value={formData.username}
              onChange={handleChange}
              title="El usuario debe tener entre 3 y 16 caracteres (letras, números o guiones bajos)"
            />
            <Input 
              label="Contraseña" 
              name="password"
              type="password" 
              placeholder="••••••••" 
              icon={Lock} 
              required 
              value={formData.password}
              onChange={handleChange}
              title="La contraseña debe tener al menos 8 caracteres, incluyendo letras y números"
            />
            
            <Button type="submit" loading={loading} className="w-full h-12 text-lg mt-2">
              Ingresar al Sistema
            </Button>

            <div className="text-center mt-4">
              <p className="text-slate-500 text-sm">
                ¿No tienes una cuenta?{' '}
                <button 
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-register'))}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </form>
        </Card>
        
        <p className="text-center mt-6 text-xs text-slate-400 uppercase font-bold tracking-widest">
          Power by Gemini AI & SQL Triggers
        </p>
      </div>
    </div>
  );
};

export default LoginPage;