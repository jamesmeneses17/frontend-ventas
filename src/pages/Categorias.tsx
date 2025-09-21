import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/categorias")
      .then((res) => {
        // Asegurar que res.data sea un array
        if (Array.isArray(res.data)) {
          setCategorias(res.data);
        } else {
          setCategorias([]);
          setError("Los datos recibidos no tienen el formato esperado");
        }
      })
      .catch((err) => {
        console.error("Error al cargar categorías:", err);
        setError("Error al cargar las categorías");
        setCategorias([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Cargando categorías...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

 return (
  <div>
    <h1>Categorías</h1>
    <ul>
      {Array.isArray(categorias) && categorias.length > 0 ? (
        categorias.map((cat) => (
          <li key={cat.id}>{cat.nombre}</li>
        ))
      ) : (
        <li>No hay categorías disponibles</li>
      )}
    </ul>
  </div>
);

}
