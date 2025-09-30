import Button from "../ui/button";
import InputField from "../ui/InputField";

export default function RegisterForm() {
  return (
    <form className="space-y-6">
      <InputField id="name" label="Nombre completo" required autoComplete="name" />
      <InputField id="email" label="Correo electrónico" type="email" required autoComplete="email" />
      <InputField id="password" label="Contraseña" type="password" required autoComplete="new-password" />
      <InputField id="confirmPassword" label="Confirmar contraseña" type="password" required autoComplete="new-password" />
      <Button type="submit">Registrarse</Button>
    </form>
  );
}
