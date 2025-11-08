import React from 'react';

// Permitimos todos los atributos nativos de un <input> y mantenemos
// `label` y `name` como props requeridas a nivel de componente.
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  className?: string;
}

export default function FormInput({
  label,
  name,
  className = '',
  // Capturamos el resto de props nativas (value, onChange, type, min, max, disabled, etc.)
  ...rest
}: FormInputProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {rest.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        {...rest}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed`}
      />
    </div>
  );
}