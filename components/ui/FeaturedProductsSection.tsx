// /components/ui/FeaturedProductsSection.tsx
"use client"; 

import React, { useState, useEffect } from 'react';
// Importamos el servicio de categorías temporalmente
import { getCategorias, Categoria } from '../../components/services/categoriasService'; 

// 🛑 FUTURO: Cuando tengas el servicio de productos, cambiarás esto:
// import { getFeaturedProducts, Producto } from '../../services/productosService'; 

interface ProductCardDisplayProps extends Categoria { 
  // 🛑 TEMPORAL: Usamos la interfaz Categoria.
  // FUTURO: Cambiar a 'extends Producto'
  descripcion?:string;
  imageSrc: string; 
  href: string;     
}

// Lógica de mapeo de imágenes (Se mantiene igual por ahora)
const mapCategoryToImage = (nombre: string): string => {
  const slug = nombre.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    .replace(/\s+/g, '-'); 

  // Mapeo temporal. En un futuro, podrías usar la URL de la imagen del producto
  switch (slug) {
    case 'paneles-solares':
    case 'energia-solar':
    case 'energia-solar-sostenible':
      return '/images/panel.webp';
    case 'baterias-solares':
    case 'baterias':
      return '/images/bateria.webp';
    case 'controladores':
    case 'controlador':
      return '/images/controladores.webp';
    case 'iluminacion-solar':
    case 'iluminacion-ac':
    case 'alumbrado-solar':
      return '/images/iluminacion-solar.webp';
    case 'sistemas-de-bombeo': 
      return '/images/imagen.webp'; 
    default:
      return '/images/imagen.webp'; 
  }
};


// 🛑 CAMBIO CLAVE: Componente de Tarjeta de Producto (reutiliza el estilo de categoría)
// Se puede adaptar para mostrar precio y rating (como en la imagen de ejemplo)
const ProductCard: React.FC<ProductCardDisplayProps> = ({ nombre, descripcion, imageSrc, href }) => (
  <a href={href} className="group relative block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
    <img 
      className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 transition duration-300" 
      src={imageSrc} 
      alt={nombre}
    />
    {/* Contenedor para texto */}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
    <div className="relative p-6 pt-40 flex flex-col justify-end h-full">
      <div className="flex items-center space-x-2 text-white mb-2">
        <h3 className="text-xl font-bold">{nombre}</h3> 
      </div>
      <p className="text-sm text-gray-300">{descripcion || "Soluciones y productos de energía solar."}</p>
      {/* 🛑 ELEMENTOS VISUALES TEMPORALES ADICIONALES (Opcional: para parecer más un producto) */}
      <div className="mt-2 text-yellow-400 flex space-x-0.5">
        {'★'.repeat(5)} {/* Simulación de Rating 5 estrellas */}
      </div>
      {/* 🛑 TEMPORAL: Precio fijo o variable */}
      <p className="text-lg font-semibold text-white mt-1">$1.000.000</p>
    </div>
  </a>
);


const FeaturedProductsSection: React.FC = () => {
  // 🛑 Cambiamos el tipo para prepararnos para productos, aunque use categorías
  const [items, setItems] = useState<Categoria[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const maxItems = 4; // Límite para productos destacados

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 🛑 LÓGICA TEMPORAL: Cargamos categorías
        const data = await getCategorias();
        const activeItems = data.filter(c => c.estadoId === 1); 
        
        // 🛑 FUTURO: Aquí iría la llamada a getFeaturedProducts()
        
        setItems(activeItems);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar productos destacados:", err); 
        setError(true);
        setLoading(false);
      }
    };
    fetchData();
  }, []); 

  const displayedItems: ProductCardDisplayProps[] = items
    .slice(0, maxItems) 
    .map(item => ({
      ...item,
      // Usamos el ID del elemento para la clave única (asumiendo que está en Categoria)
      imageSrc: mapCategoryToImage(item.nombre), 
      href: `/productos/${item.id}`, // Enlace a la página de detalle del producto (ID)
    }));

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
    <section className="py-16 bg-white"> 
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          {/* 🛑 TÍTULO FIJO PARA PRODUCTOS DESTACADOS */}
          <h2 className="text-4xl font-extrabold text-gray-900">
            Productos Destacados
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Los productos más populares y mejor valorados por nuestros clientes.
          </p>
        </div>

        {displayedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedItems.map((item) => (
              // 🛑 Usamos ProductCard aquí
              <ProductCard key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">
            No hay productos destacados para mostrar.
          </p>
        )}

        {/* Botón para ver más productos (opcional) */}
        <div className="mt-12 text-center">
          <a
            href="/productos"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-amber-600 hover:bg-amber-700 transition duration-150"
          >
            Ver todos los productos →
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;