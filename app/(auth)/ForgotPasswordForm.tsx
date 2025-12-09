"use client";

import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/button";
import React, { useState } from 'react';
import { API_URL } from "../../components/services/apiConfig";

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    console.log('API_URL:', API_URL);
    console.log('Intentando POST a:', `${API_URL}/auth/forgot-password`);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Se envió un enlace de recuperación a tu correo. Por favor revisa tu bandeja de entrada.'
        });
        setEmail('');
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'No se pudo procesar la solicitud. Intenta de nuevo.'
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
        <div className={`p-4 rounded-lg text-center font-semibold ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <InputField
        label="Correo Electrónico"
        id="email"
        name="email"
        type="email"
        placeholder="tu.correo@ejemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />
      
      <Button
        type="submit"
        disabled={loading}
        className="w-full justify-center bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-white"
      >
        {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;