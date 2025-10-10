import React from "react";

interface ProductCardProps {
  id: number;
  nombre: string;
  valor_unitario: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ nombre, valor_unitario }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition duration-300">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{nombre}</h3>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold text-yellow-600">
          ${valor_unitario.toLocaleString("es-CO")}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
