import Button from "../ui/button";
import InputField from "../ui/InputField";

export default function LoginForm() {
  return (
    <form className="space-y-6">
      <InputField id="email" label="Correo electrónico" type="email" required autoComplete="email" />
      <InputField id="password" label="Contraseña" type="password" required autoComplete="current-password" />
      <Button type="submit">Acceder</Button>
    </form>
  );
}
