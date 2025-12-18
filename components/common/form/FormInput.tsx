
import React, { forwardRef } from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  className?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={props.name} className="block text-sm font-medium text-gray-700">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        {...props}
        ref={ref}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
);

FormInput.displayName = "FormInput";
export default FormInput;