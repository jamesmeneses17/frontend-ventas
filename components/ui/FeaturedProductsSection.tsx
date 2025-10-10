// /components/ui/FeaturedProductsSection.tsx
"use client"; 

import React, { useState, useEffect } from 'react';
// 🛑 Importamos el servicio y la interfaz Producto
import { getProductos, Producto } from '../../components/services/productosService'; 

interface ProductCardDisplayProps extends Producto { 
  imageSrc: string; 
  href: string;     
  displayPrice: string; 
  displayDescription: string;
}

// Lógica de mapeo de imágenes (Usaremos genéricas hasta tener un campo de imagen real en Producto)
const mapProductToImage = (id: number | undefined): string => {
  // Aquí puedes mapear IDs/SKUs a imágenes o usar una URL que venga del API
  // TEMPORAL: Usamos un patrón básico
  if (id === 1) return '/images/panel.webp'; 
  if (id === 2) return '/images/bateria.webp';
  if (id === 3) return '/images/controladores.webp';
  if (id === 4) return '/images/iluminacion-solar.webp';
  
  // Imagen por defecto 
  return '/images/imagen-defecto.webp'; 
};

// Componente de Tarjeta de Producto
const ProductCard: React.FC<ProductCardDisplayProps> = ({ nombre, displayDescription, imageSrc, href, displayPrice }) => (
  // Estilo de tarjeta simple y elegante para productos
  <a href={href} className="group relative block rounded-xl overflow-hidden shadow-lg transition duration-300 transform hover:-translate-y-1 bg-white">
    {/* Imagen */}
    <div className="h-48">
      <img 
        className="h-full w-full object-cover transition duration-300" 
        src={imageSrc} 
        alt={nombre}
      />
      {/* Puedes agregar etiquetas como "Más Vendido" o "Nuevo" aquí si se necesita */}
    </div>
    
    <div className="p-4 flex flex-col justify-between h-full">
      {/* Rating (Simulación) */}
      <div className="text-yellow-400 flex space-x-0.5 mb-2 text-sm">
        {'★'.repeat(5)} 
      </div>
      
      {/* Nombre y Descripción */}
      <h3 className="text-lg font-bold text-gray-900">{nombre}</h3> 
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{displayDescription}</p>
      
      {/* Precio y Botón */}
      <div className="mt-4 flex justify-between items-center">
        <p className="text-xl font-extrabold text-amber-600">{displayPrice}</p>
        <button
          className="px-3 py-1 text-xs font-medium rounded-lg text-white bg-gray-800 hover:bg-amber-600 transition duration-150"
          onClick={(e) => { e.preventDefault(); /* Navegar a detalle */ }}
        >
          Ver más
        </button>
      </div>
    </div>
  </a>
);


const FeaturedProductsSection: React.FC = () => {
  const [products, setProducts] = useState<Producto[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // 🛑 Límite estricto de 4 productos
  const maxItems = 4; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getProductos();
        
        // El API ya trae solo activos (estadoId: 1)
        setProducts(data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar productos destacados:", err); 
        setError(true);
        setLoading(false);
      }
    };
    fetchData();
  }, []); 

  // Función de formato de precio (Moneda colombiana COP)
  const formatPrice = (price: number): string => {
      // Usamos el locale de Colombia (es-CO)
      return price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  }

  const displayedProducts: ProductCardDisplayProps[] = products
    // 🛑 Aplicamos el límite de 4 aquí
    .slice(0, maxItems) 
    .map(product => {
        // Asumimos el primer precio en el array de precios. Si no existe, usamos 0.
        let finalPrice = product.precios?.[0]?.valor ?? 0;
        
        // Descripción por defecto si no viene del API
        const description = product.descripcion || "Producto de energía solar de alta calidad.";

        return {
            ...product,
            imageSrc: mapProductToImage(product.id), 
            href: `/productos/${product.id}`,
            displayPrice: formatPrice(finalPrice),
            displayDescription: description,
        };
    });

  // ... (Manejo de loading y error, que se mantienen igual)
  if (loading) {
    return (
      <section className="py-16 text-center">
        <p className="text-lg text-amber-600">Cargando productos destacados...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 text-center">
        <p className="text-lg text-red-600">Error al cargar los productos. Intente de nuevo más tarde.</p>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50"> 
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900">
            Productos Destacados
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Los productos más populares y mejor valorados por nuestros clientes.
          </p>
        </div>

        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">
            No hay productos activos para mostrar en este momento.
          </p>
        )}

        {/* Botón para ver más productos */}
        <div className="mt-12 text-center">
          <a
            href="/productos"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-amber-600 hover:bg-amber-700 transition duration-150"
          >
            Ver catálogo completo →
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;