"use client";

import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import Button from "../ui/button";
import InputField from "../ui/InputField";

export default function RegisterForm() {
  return (
    <form className="space-y-6">
      <InputField
        id="name"
        label="Nombre completo"
        icon={UserIcon}
        required
        autoComplete="name"
      />
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
        autoComplete="new-password"
      />
      <InputField
        id="confirmPassword"
        label="Confirmar contraseña"
        type="password"
        icon={KeyIcon}
        required
        autoComplete="new-password"
      />
      <Button type="submit">Registrarse</Button>
    </form>
  );
}
