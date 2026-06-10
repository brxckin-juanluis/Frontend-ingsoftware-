import React, { useState } from 'react';
import { Car, User, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../services/api';
import Card from '../Components/ui/Card';
import Input from '../Components/ui/Input';
import Button from '../Components/ui/Button';

const RegisterPage = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    setLoading(true);
    setError('');
    
    try {
      // Intentamos registrar al usuario
      await authService.register({
        username: formData.username,
        password1: formData.password,
        password2: formData.confirmPassword
      });
      
      setSuccess(true);
      // Redirigir al login después de un breve delay
      setTimeout(() => {
        onBack();
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Error al crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">¡Usuario creado!</h2>
          <p className="text-slate-600 mt-2">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/40">
            <Car className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">SmartParking</h1>
          <p className="text-slate-500 font-medium tracking-wide">Crear Nueva Cuenta</p>
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
              label="Nombre de Usuario" 
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

            <Input 
              label="Confirmar Contraseña" 
              name="confirmPassword"
              type="password" 
              placeholder="••••••••" 
              icon={Lock} 
              required 
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            
            <Button type="submit" loading={loading} className="w-full h-12 text-lg mt-2">
              Registrar Usuario
            </Button>

            <button 
              type="button" 
              onClick={onBack}
              className="flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors py-2"
            >
              <ArrowLeft size={18} />
              Volver al Login
            </button>
          </form>
        </Card>
        
        <p className="text-center mt-6 text-xs text-slate-400 uppercase font-bold tracking-widest">
          Power by Gemini AI & SQL Triggers
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;