import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

interface Producto {
  id: number;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  valorUnitario?: string;
  stock?: number;
  descuento?: string;
  enPromocion?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  imagenUrl?: string;
  categoria?: { id: number; nombre: string };
  subcategoria?: { id: number; nombre: string; descripcion?: string };
  marca?: { id: number; nombre: string; descripcion?: string };
  unidadMedida?: { id: number; nombre: string; abreviatura?: string };
  especificacionesTecnicas?: { id: number; descripcion: string };
  fichaTecnica?: { id: number; descripcion: string; archivo_url?: string };
}

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/productos")
      .then((res) => {
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
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Productos</h1>
      <ul>
        {productos.length > 0 ? (
          productos.map((prod) => (
            <li key={prod.id} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
              <strong>{prod.nombre}</strong> <br />
              {prod.codigo && <span>Código: {prod.codigo}</span>} <br />
              {prod.descripcion && <span>Descripción: {prod.descripcion}</span>} <br />
              {prod.valorUnitario && <span>Valor unitario: ${prod.valorUnitario}</span>} <br />
              {prod.stock !== undefined && <span>Stock: {prod.stock}</span>} <br />
              {prod.descuento && <span>Descuento: {prod.descuento}%</span>} <br />
              {prod.enPromocion !== undefined && <span>En promoción: {prod.enPromocion ? "Sí" : "No"}</span>} <br />
              {prod.categoria && <span>Categoría: {prod.categoria.nombre}</span>} <br />
              {prod.subcategoria && <span>Subcategoría: {prod.subcategoria.nombre}</span>} <br />
              {prod.marca && <span>Marca: {prod.marca.nombre}</span>} <br />
              {prod.unidadMedida && <span>Unidad de medida: {prod.unidadMedida.nombre} ({prod.unidadMedida.abreviatura})</span>} <br />
              {prod.especificacionesTecnicas && <span>Especificaciones técnicas: {prod.especificacionesTecnicas.descripcion}</span>} <br />
              {prod.fichaTecnica && (
                <>
                  <span>Ficha técnica: {prod.fichaTecnica.descripcion}</span> <br />
                  {prod.fichaTecnica.archivo_url && <a href={prod.fichaTecnica.archivo_url} target="_blank">Descargar Ficha Tecnica</a>} <br />
                </>
              )}
              {prod.imagenUrl && <img src={prod.imagenUrl} alt={prod.nombre} style={{ width: "150px", marginTop: "5px", display: "block" }} />}
            </li>
          ))
        ) : (
          <li>No hay productos disponibles</li>
        )}
      </ul>
    </div>
  );
}
