"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Button from "../ui/button";
import InputField from "../ui/InputField";
import { useAuth } from '../../contexts/AuthContext';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password);
      // Redirigir al dashboard después del login exitoso
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField 
        id="email"
        name="email" 
        label="Correo electrónico" 
        type="email" 
        icon={EnvelopeIcon}
        required 
        autoComplete="email" 
      />
      <InputField 
        id="password"
        name="password"
        label="Contraseña" 
        type="password" 
        icon={LockClosedIcon}
        required 
        autoComplete="current-password" 
      />
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Iniciando sesión...' : 'Acceder'}
      </Button>
    </form>
  );
}
