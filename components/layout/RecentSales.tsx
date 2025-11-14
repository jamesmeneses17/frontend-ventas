"use client";

import { formatCurrency } from '@/utils/formatters';

interface Sale {
  id: number;
  cliente: string;
  producto: string;
  fecha: string;
  total: number;
}

interface RecentSalesProps {
  sales: Sale[];
}

export default function RecentSales({ sales }: RecentSalesProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-5 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Ventas Recientes</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {sales.length > 0 ? (
          sales.map((sale) => (
            <div
              key={sale.id}
              className="p-4 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{sale.cliente}</p>
                <p className="text-xs text-gray-500">
                  {sale.producto} • {sale.fecha}
                </p>
              </div>
              <p className="text-sm font-semibold text-green-600">
                {formatCurrency(sale.total, 'COP')}
              </p>
            </div>
          ))
        ) : (
          <div className="p-4 text-sm text-gray-500">No hay ventas recientes</div>
        )}
      </div>
    </div>
  );
}
