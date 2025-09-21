import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  categoria?: {
    id: number;
    nombre: string;
  };
  subcategoria?: {
    id: number;
    nombre: string;
  };
  marca?: {
    id: number;
    nombre: string;
  };
}

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/productos")
      .then((res) => {
        // Asegurar que res.data sea un array
        if (Array.isArray(res.data)) {
          setProductos(res.data);
        } else {
          setProductos([]);
          setError("Los datos recibidos no tienen el formato esperado");
        }
      })
      .catch((err) => {
        console.error("Error al cargar productos:", err);
        setError("Error al cargar los productos");
        setProductos([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Cargando productos...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Productos</h1>
      <ul>
        {Array.isArray(productos) && productos.length > 0 ? (
          productos.map((prod) => (
            <li key={prod.id}>
              <strong>{prod.nombre}</strong>
              {prod.descripcion && ` - ${prod.descripcion}`} <br />
              {prod.categoria && <span>Categoría: {prod.categoria.nombre}</span>} <br />
              {prod.subcategoria && <span>Subcategoría: {prod.subcategoria.nombre}</span>} <br />
              {prod.marca && <span>Marca: {prod.marca.nombre}</span>}
            </li>
          ))
        ) : (
          <li>No hay productos disponibles</li>
        )}
      </ul>
    </div>
  );
}
