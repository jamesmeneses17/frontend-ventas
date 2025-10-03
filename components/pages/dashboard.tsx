import RecentSales from "@/components/layout/RecentSales";

export default function DashboardPage() {
  // Ejemplo de datos mock
  const sales = [
    { id: 1, cliente: "Carlos", producto: "Panel Solar", fecha: "2025-10-02", total: 1200 },
    { id: 2, cliente: "María", producto: "Inversor", fecha: "2025-10-03", total: 800 },
  ];

  return (
    <div className="space-y-6">
      {/* Tus otras cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold">Ventas por Categoría</h3>
          <div className="mt-4 text-gray-500 text-sm">
            [Espacio para Gráfico de Ventas por Categoría]
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold">Productos Más Vendidos</h3>
          <div className="mt-4 text-gray-500 text-sm">
            [Espacio para Lista o Tabla de Productos]
          </div>
        </div>
      </div>

      {/* Aquí metemos la nueva card */}
      <RecentSales sales={sales} />
    </div>
  );
}
