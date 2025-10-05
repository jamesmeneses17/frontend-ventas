// /components/ui/CategorySection.tsx (MODIFICADO para "Ver Más")

import React from 'react';

// Define la estructura de datos para una tarjeta de categoría (Mantenido)
interface CategoryCardProps {
  title: string;
  description: string;
  imageSrc: string; 
  href: string;     
}

// Componente individual de la tarjeta de categoría (Mantenido)
const CategoryCard: React.FC<CategoryCardProps> = ({ title, description, imageSrc, href }) => (
  // ... (El código de la tarjeta CategoryCard se mantiene igual) ...
  <a href={href} className="group relative block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
    <img 
      className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 transition duration-300" 
      src={imageSrc} 
      alt={title}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
    <div className="relative p-6 pt-40 flex flex-col justify-end h-full">
      <div className="flex items-center space-x-2 text-white mb-2">
        {/* Usando un ícono simple. Si tienes un componente Icon/SVG, úsalo aquí */}
        <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zM5.5 10a.5.5 0 01.5-.5h8a.5.5 0 010 1h-8a.5.5 0 01-.5-.5z"/></svg>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  </a>
);

// Datos de ejemplo para las categorías (¡Ahora incluyendo las 8 para el ejemplo!)
// Fragmento de datos para /components/ui/CategorySection.tsx

const allCategories: CategoryCardProps[] = [
  { 
    title: 'Paneles Solares', 
    description: 'Policristalinos y monocristalinos de alta eficiencia', 
    // Usando 'panel.webp' de tu estructura de carpetas
    imageSrc: '/images/panel.webp', 
    href: '/productos?categoria=paneles' 
  },
  { 
    title: 'Baterías Solares', 
    description: 'Almacenamiento de energía para uso nocturno o backup', 
    // Usando 'bateria.webp' de tu estructura de carpetas
    imageSrc: '/images/bateria.webp', 
    href: '/productos?categoria=baterias' 
  },
  { 
    title: 'Controladores', 
    description: 'Regulación y protección de tu sistema solar', 
    // Usando 'controladores.webp' de tu estructura de carpetas
    imageSrc: '/images/controladores.webp', 
    href: '/productos?categoria=controladores' 
  },
  { 
    title: 'Iluminación Solar', 
    description: 'Soluciones de alumbrado público y residencial', 
    // Usando 'iluminacion-solar.webp' de tu estructura de carpetas
    imageSrc: '/images/iluminacion-solar.webp', 
    href: '/productos?categoria=iluminacion' 
  },
  // Añadiendo las 4 categorías restantes con una imagen genérica (imagen.webp)
  { 
    title: 'Inversores', 
    description: 'Convierte la energía solar en electricidad utilizable.', 
    imageSrc: '/images/imagen.webp', 
    href: '/productos?categoria=inversores' 
  },
  { 
    title: 'Sistemas de Bombeo', 
    description: 'Soluciones de bombeo de agua eficientes con energía solar.', 
    imageSrc: '/images/imagen.webp', 
    href: '/productos?categoria=bombeo' 
  },
  { 
    title: 'Estructuras y Soportes', 
    description: 'Sistemas de montaje para techos y suelos.', 
    imageSrc: '/images/imagen.webp', 
    href: '/productos?categoria=estructuras' 
  },
  { 
    title: 'Accesorios y Cables', 
    description: 'Componentes para completar tu instalación solar.', 
    imageSrc: '/images/imagen.webp', 
    href: '/productos?categoria=accesorios' 
  },
];


const CategorySection: React.FC = () => {
  // Solo mostramos las primeras 4 categorías en la landing page
  const displayedCategories = allCategories.slice(0, 4);

  return (
    <section className="py-16 bg-white"> 
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de la Sección (Mantenido) */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900">
            Nuestras Categorías
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Explora nuestra amplia gama de productos solares para encontrar la solución
            perfecta para tus necesidades.
          </p>
        </div>

        {/* Grid de Categorías (Limitado a 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedCategories.map((category, index) => (
            <CategoryCard key={index} {...category} />
          ))}
        </div>

        {/* Botón de "Ver Más" / "Explorar Todo" */}
        <div className="mt-12 text-center">
          <a
            href="/productos" // Enlaza directamente a la página donde se ven TODOS los productos/categorías
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-amber-600 hover:bg-amber-700 transition duration-150"
          >
            Explorar todas las {allCategories.length} categorías →
          </a>
        </div>
        
      </div>
    </section>
  );
};

export default CategorySection;