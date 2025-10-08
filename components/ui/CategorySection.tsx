// /components/ui/CategorySection.tsx

"use client"; 

import React, { useState, useEffect } from 'react';
// Asegúrate de que la ruta de importación sea correcta si el archivo está en ui/
import { getCategorias, Categoria } from '../services/categoriasService'; 

interface CategoryCardDisplayProps extends Categoria {
  imageSrc: string; 
  href: string;     
}

const mapCategoryToImage = (nombre: string): string => {
  const slug = nombre.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    .replace(/\s+/g, '-'); 

  switch (slug) {
    case 'paneles-solares':
    case 'energia-solar':
    case 'energia-solar-sostenible': // Puedes agregar variaciones de energía solar si es necesario
      return '/images/panel.webp';
    case 'baterias-solares':
    case 'baterias':
      return '/images/bateria.webp';
    case 'controladores':
    case 'controlador':
      return '/images/controladores.webp';
    case 'iluminacion-solar':
    case 'iluminacion-ac':
    case 'alumbrado-solar': // Agregado para coincidir con la categoría del API
      return '/images/iluminacion-solar.webp';
    case 'sistemas-de-bombeo': // Agregado para coincidir con la categoría del API
      return '/images/imagen.webp'; // Usa una imagen genérica para este caso
    default:
      return '/images/imagen.webp'; 
  }
};


const CategoryCard: React.FC<CategoryCardDisplayProps> = ({ nombre,  imageSrc, href }) => (
  <a href={href} className="group relative block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
    <img 
      className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 transition duration-300" 
      src={imageSrc} 
      alt={nombre}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
    <div className="relative p-6 pt-40 flex flex-col justify-end h-full">
      <div className="flex items-center space-x-2 text-white mb-2">
        <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zM5.5 10a.5.5 0 01.5-.5h8a.5.5 0 010 1h-8a.5.5 0 01-.5-.5z"/></svg>
        <h3 className="text-xl font-bold">{nombre}</h3> 
      </div>
      {/* La descripción puede ser undefined si el API no la incluye */}
      <p className="text-sm text-gray-300">{ "Soluciones y productos de energía solar."}</p>
    </div>
  </a>
);


const CategorySection: React.FC = () => {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategorias();
        
        // 🚨 CAMBIO CLAVE: Lógica de filtrado ajustada 🚨
        // Filtra solo si el campo 'estado' existe Y es 'Inactivo'.
        // Si el campo 'estado' NO existe (es undefined), la categoría se incluye.
        
        // Si tienes categorías que vienen de la BD con el estado "Activo" (con mayúscula), usa esta línea:
        // const activeCategories = data.filter(c => !c.estado || c.estado === 'Activo');

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar categorías:", err); // Muestra el error de red en consola
        setError(true);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []); 

  const displayedCategories: CategoryCardDisplayProps[] = categories
    .slice(0, 4) 
    .map(cat => ({
      ...cat,
      // Asegúrate de que tu interfaz Categoria tenga 'descripcion' para que el spread '...cat' funcione, 
      // si no la tiene, agrega 'descripcion: cat.descripcion || ""' explícitamente si TypeScript da error.
      imageSrc: mapCategoryToImage(cat.nombre), 
      href: `/productos?categoria=${cat.nombre.toLowerCase().replace(/\s+/g, '-')}`,
    }));

  if (loading) {
    return (
      <section className="py-16 text-center">
        <p className="text-lg text-amber-600">Cargando categorías...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 text-center">
        <p className="text-lg text-red-600">Error al cargar las categorías. Intente de nuevo más tarde.</p>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white"> 
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900">
            Nuestras Categorías
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Explora nuestra amplia gama de productos solares para encontrar la solución
            perfecta para tus necesidades.
          </p>
        </div>

        {displayedCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedCategories.map((category) => (
              <CategoryCard key={category.id} {...category} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">
            No hay categorías activas para mostrar. Revisa la conexión al API o el estado de los datos.
          </p>
        )}

        {categories.length > 4 && (
          <div className="mt-12 text-center">
            <a
              href="/productos"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-amber-600 hover:bg-amber-700 transition duration-150"
            >
              Explorar todas las {categories.length} categorías →
            </a>
          </div>
        )}
        
      </div>
    </section>
  );
};

export default CategorySection;