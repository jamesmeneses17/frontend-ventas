import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  type?: "button" | "submit";
}

export default function Button({ children, type = "button" }: ButtonProps) {
  return (
    <div className="w-3/4 mx-auto mt-6">
      <button
        type="submit"
        className="flex w-full justify-center rounded-full bg-indigo-500 px-full py-1.5 text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      >
        {children}
      </button>
    </div>
  );
}
