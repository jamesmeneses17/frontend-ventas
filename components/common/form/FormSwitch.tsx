import React from 'react';

interface FormSwitchProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  description?: string;
}

export default function FormSwitch({
  label,
  name,
  checked,
  onChange,
  className = '',
  description
}: FormSwitchProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex flex-col">
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
            checked ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
          onClick={() => onChange({ target: { name, checked: !checked } } as React.ChangeEvent<HTMLInputElement>)}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${
              checked ? 'translate-x-5' : 'translate-x-0.5'
            } mt-0.5`}
          />
        </div>
      </div>
    </div>
  );
}