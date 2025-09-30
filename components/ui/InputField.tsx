interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}

export default function InputField({
  id,
  label,
  type = "text",
  required = false,
  autoComplete,
  placeholder,
}: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-2">
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className=" block w-full rounded px-3 py-2 border  text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
    </div>
  );
}
