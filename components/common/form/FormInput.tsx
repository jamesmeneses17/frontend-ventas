import React from 'react';

// Permitimos todos los atributos nativos de un <input> y mantenemos
// `label` y `name` como props requeridas a nivel de componente.
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  className?: string;
  error?: string;
}

// Usamos forwardRef para permitir recibir ref externamente.
// También soportamos que el caller haga `...register('field')` y pase la propiedad `ref` dentro de los props.
const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, name, className = '', ...rest }, ref) => {
    // Extraemos cualquier `ref` que venga en los props (por ejemplo al hacer {...register('field')}).
    const { ref: registerRef, error, ...inputProps } = rest as any;

    // Decidimos cuál ref usar en el <input>: primero el que viene de register, si existe, sino el forwarded ref.
    const finalRef = registerRef ?? ref;

    // Evitar duplicar la prop `name` si ya viene dentro de inputProps (por ejemplo al hacer {...register('campo')}).
    const finalInputProps = { ...inputProps } as any;
    if (!finalInputProps.name) finalInputProps.name = name;

    return (
      <div className={`space-y-1 ${className}`}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {finalInputProps.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          id={name}
          {...finalInputProps}
          ref={finalRef}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed`}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;