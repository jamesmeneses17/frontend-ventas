import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    api.get("/categorias").then((res) => {
      setCategorias(res.data);
    });
  }, []);

 return (
  <div>
    <h1>Categorías</h1>
    <ul>
      {Array.isArray(categorias) && categorias.map((cat) => (
        <li key={cat.id}>{cat.nombre}</li>
      ))}
    </ul>
  </div>
);

}
