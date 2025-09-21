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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/subcategorias")
      .then((res) => {
        // Asegurar que res.data sea un array
        if (Array.isArray(res.data)) {
          setSubcategorias(res.data);
        } else {
          setSubcategorias([]);
          setError("Los datos recibidos no tienen el formato esperado");
        }
      })
      .catch((err) => {
        console.error("Error al cargar subcategorías:", err);
        setError("Error al cargar las subcategorías");
        setSubcategorias([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Cargando subcategorías...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Subcategorías</h1>
      <ul>
        {Array.isArray(subcategorias) && subcategorias.length > 0 ? (
          subcategorias.map((sub) => (
            <li key={sub.id}>
              <strong>{sub.nombre}</strong> ({sub.categoria?.nombre || 'Sin categoría'})
            </li>
          ))
        ) : (
          <li>No hay subcategorías disponibles</li>
        )}
      </ul>
    </div>
  );
}
