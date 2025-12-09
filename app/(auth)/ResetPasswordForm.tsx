"use client";

import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/button";
import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from "../../components/services/apiConfig";

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nuevaContrasena: '',
    confirmarContrasena: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validaciones
    if (formData.nuevaContrasena.length < 6) {
      setMessage({
        type: 'error',
        text: 'La contraseña debe tener al menos 6 caracteres.'
      });
      return;
    }

    if (formData.nuevaContrasena !== formData.confirmarContrasena) {
      setMessage({
        type: 'error',
        text: 'Las contraseñas no coinciden.'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          nuevaContrasena: formData.nuevaContrasena,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Contraseña actualizada correctamente. Redirigiendo al login...'
        });
        
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'No se pudo actualizar la contraseña. El enlace puede haber expirado.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al conectar con el servidor. Intenta de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`flex items-start gap-3 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          )}
          <p className={`text-sm font-medium ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      <InputField
        label="Nueva Contraseña"
        id="nuevaContrasena"
        name="nuevaContrasena"
        type={showPassword ? "text" : "password"}
        placeholder="Mínimo 6 caracteres"
        value={formData.nuevaContrasena}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <InputField
        label="Confirmar Contraseña"
        id="confirmarContrasena"
        name="confirmarContrasena"
        type={showPassword ? "text" : "password"}
        placeholder="Repite tu contraseña"
        value={formData.confirmarContrasena}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
          disabled={loading}
          className="rounded"
        />
        Mostrar contraseña
      </label>

      <Button
        type="submit"
        disabled={loading}
        className="w-full justify-center bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-white"
      >
        {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
