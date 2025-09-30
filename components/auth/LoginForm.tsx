"use client";

import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Button from "../ui/button";
import InputField from "../ui/InputField";

export default function LoginForm() {
  return (
    <form className="space-y-6" >
      <InputField 
        id="email" 
        label="Correo electrónico" 
        type="email" 
        icon={EnvelopeIcon}
        required 
        autoComplete="email" 
      />
      <InputField 
        id="password" 
        label="Contraseña" 
        type="password" 
        icon={LockClosedIcon}
        required 
        autoComplete="current-password" 
      />
      <Button type="submit">Acceder</Button>
    </form>
  );
}
