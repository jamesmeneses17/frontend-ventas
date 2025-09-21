import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

interface Subcategoria {
  id: number;
  nombre: string;
  descripcion?: string;
  categoria?: {
    id: number;
    nombre: string;
  };
}

export default function Subcategorias() {
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);

  useEffect(() => {
    api.get("/subcategorias").then((res) => {
      setSubcategorias(res.data);
    });
  }, []);

  return (
    <div>
      <h1>Subcategorías</h1>
      <ul>
        {subcategorias.map((sub) => (
          <li key={sub.id}>
            <strong>{sub.nombre}</strong> ({sub.categoria?.nombre})
          </li>
        ))}
      </ul>
    </div>
  );
}
