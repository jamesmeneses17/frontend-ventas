// components/layout/FinancialSummary.tsx

import React from 'react';

// --- INTERFACES DE DATOS ---
interface DailyData {
  fecha: string;
  mes: string;
  ingreso: number;
  egreso: number;
  gasto: number;
  saldo: number;
}
interface MonthlyData {
  mes: string;
  ingresos: number;
  egresos: number;
  gastos: number;
  saldo: number;
}

// --- DATOS DE EJEMPLO (REEMPLAZAR CON LA API) ---
// Datos Mensuales (simulando los del Excel)
const monthlyData: MonthlyData[] = [
  { mes: "Enero", ingresos: 0, egresos: 0, gastos: 0, saldo: 0 },
  { mes: "Febrero", ingresos: 0, egresos: 0, gastos: 0, saldo: 0 },
  { mes: "Marzo", ingresos: 0, egresos: 0, gastos: 0, saldo: 0 },
  { mes: "Abril", ingresos: 0, egresos: 0, gastos: 0, saldo: 0 },
  { mes: "Mayo", ingresos: 0, egresos: 0, gastos: 0, saldo: 0 },
  { mes: "Junio", ingresos: 0, egresos: 0, gastos: 0, saldo: 0 },
  { mes: "Julio", ingresos: 0, egresos: 0, gastos: 0, saldo: 0 },
  { mes: "Agosto", ingresos: 0, egresos: 0, gastos: 0, saldo: 0 },
  { mes: "Septiembre", ingresos: 1151400, egresos: 0, gastos: 15000, saldo: 819938 },
  { mes: "Octubre", ingresos: 608000, egresos: 0, gastos: 0, saldo: 608000 },
  { mes: "Noviembre", ingresos: 0, egresos: 0, gastos: 0, saldo: 0 },
  { mes: "Diciembre", ingresos: 0, egresos: 0, gastos: 0, saldo: 0 },
];

// Datos Diarios (simulando los del Excel)
const dailyData: DailyData[] = [
  { fecha: "4/01/2025", mes: "Enero", ingreso: 0, egreso: 0, gasto: 0, saldo: 0 },
  { fecha: "5/01/2025", mes: "Enero", ingreso: 0, egreso: 0, gasto: 0, saldo: 0 },
  { fecha: "6/01/2025", mes: "Enero", ingreso: 0, egreso: 0, gasto: 0, saldo: 0 },
  { fecha: "7/01/2025", mes: "Enero", ingreso: 0, egreso: 0, gasto: 0, saldo: 0 },
  { fecha: "1/09/2025", mes: "Septiembre", ingreso: 500000, egreso: 0, gasto: 0, saldo: 500000 },
  { fecha: "2/09/2025", mes: "Septiembre", ingreso: 651400, egreso: 0, gasto: 15000, saldo: 636400 },
  { fecha: "3/10/2025", mes: "Octubre", ingreso: 608000, egreso: 0, gasto: 0, saldo: 608000 },
];

// --- CÁLCULOS Y FUNCIONES ---
const totalIngresos = monthlyData.reduce((sum, item) => sum + item.ingresos, 0);
const totalEgresos = monthlyData.reduce((sum, item) => sum + item.egresos, 0);
const totalGastos = monthlyData.reduce((sum, item) => sum + item.gastos, 0);
const totalSaldo = totalIngresos - totalEgresos - totalGastos;

const formatCurrency = (value: number) => `$${value.toLocaleString('es-CO')}`;

// --- COMPONENTE TARJETA MENSUAL (para la sección GASTOS TOTALES POR MES) ---
interface MonthlyCardProps {
    data: MonthlyData;
}
const MonthlySummaryCard: React.FC<MonthlyCardProps> = ({ data }) => {
    const { mes, ingresos, egresos, gastos, saldo } = data;
    const isNegative = saldo < 0;

    return (
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-md">
            <h5 className={`text-center font-bold uppercase mb-3 py-1 rounded-sm ${isNegative ? 'bg-red-500 text-white' : 'bg-green-600 text-white'}`}>
                {mes}
            </h5>
            <div className="text-sm space-y-1">
                <div className="flex justify-between font-medium">
                    <span>INGRESOS:</span>
                    <span className="text-green-600">{formatCurrency(ingresos)}</span>
                </div>
                <div className="flex justify-between">
                    <span>EGRESOS:</span>
                    <span className="text-red-600">{formatCurrency(egresos)}</span>
                </div>
                <div className="flex justify-between">
                    <span>GASTOS:</span>
                    <span className="text-red-600">{formatCurrency(gastos)}</span>
                </div>
            </div>
            <div className={`mt-3 pt-2 border-t-2 ${isNegative ? 'border-red-500' : 'border-green-600'}`}>
                <div className="flex justify-between font-extrabold text-base">
                    <span>SALDO:</span>
                    <span className={isNegative ? 'text-red-600' : 'text-indigo-800'}>{formatCurrency(saldo)}</span>
                </div>
            </div>
        </div>
    );
};
// ---------------------------------------------------------------------

export default function FinancialSummary() {
  const [selectedMonth, setSelectedMonth] = React.useState('Septiembre');

  // Filtrar los datos diarios para que coincidan con el mes seleccionado
  const filteredDailyData = dailyData.filter(item => item.mes === selectedMonth);


  return (
    <div className="bg-white shadow-xl rounded-2xl border border-gray-300 p-6">
      
      <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 text-center bg-gray-100 rounded-md py-2">
        RESUMEN DIARIO MENSUAL Y ANUAL
      </h3>

      {/* -------------------- 1. RESUMEN DIARIO (Con Filtro) -------------------- */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h4 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">RESUMEN DIARIO</h4>
        
        {/* --- Filtros --- */}
        <div className="flex items-center space-x-4 mb-4">
          <label htmlFor="month-filter" className="text-sm font-medium text-gray-700">Filtrar por Mes:</label>
          <select
            id="month-filter"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {/* Opciones de los meses disponibles para el filtro */}
            {Array.from(new Set(monthlyData.map(d => d.mes))).map(mes => (
              <option key={mes} value={mes}>{mes}</option>
            ))}
          </select>
        </div>

        {/* --- Tabla de Detalle Diario --- */}
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-yellow-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">FECHA</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">MES</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">INGRESO</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">EGRESO</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">GASTO</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">SALDO</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDailyData.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{item.fecha}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{item.mes}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-green-600">{formatCurrency(item.ingreso)}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-red-600">{formatCurrency(item.egreso)}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-red-600">{formatCurrency(item.gasto)}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.saldo)}
                  </td>
                </tr>
              ))}
              {filteredDailyData.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">No hay movimientos registrados para {selectedMonth}.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------- 2. RESUMEN MENSUAL Y ANUAL (Tablas Consolidadas) -------------------- */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">RESUMEN MENSUAL CONSOLIDADO</h4>
        
        {/* Tabla Resumen Mensual */}
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-yellow-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">MES</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">INGRESOS</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">EGRESOS</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">GASTOS</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">SALDO NETO</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyData.map((item) => (
                <tr key={item.mes}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.mes}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">{formatCurrency(item.ingresos)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">{formatCurrency(item.egresos)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">{formatCurrency(item.gastos)}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                    {formatCurrency(item.saldo)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales Anuales (como en el Excel) */}
        <div className="mt-6 border-t pt-4">
          <h4 className="text-xl font-bold text-orange-600 mb-4 text-center">
            TOTALES DEL AÑO 2025
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-yellow-200 p-4 rounded-xl shadow-md">
            
            <div className="bg-white p-3 rounded-lg text-center shadow-sm border-2 border-green-400">
              <span className="font-medium text-gray-700 block">INGRESOS</span>
              <span className="text-xl font-extrabold text-green-700">{formatCurrency(totalIngresos)}</span>
            </div>

            <div className="bg-white p-3 rounded-lg text-center shadow-sm border-2 border-red-400">
              <span className="font-medium text-gray-700 block">EGRESOS</span>
              <span className="text-xl font-extrabold text-red-700">{formatCurrency(totalEgresos)}</span>
            </div>

            <div className="bg-white p-3 rounded-lg text-center shadow-sm border-2 border-red-400">
              <span className="font-medium text-gray-700 block">GASTOS</span>
              <span className="text-xl font-extrabold text-red-700">{formatCurrency(totalGastos)}</span>
            </div>
            
            <div className={`p-3 rounded-lg text-center shadow-lg border-4 ${totalSaldo >= 0 ? 'bg-indigo-50 border-indigo-500' : 'bg-red-200 border-red-700'}`}>
              <span className="font-medium text-gray-700 block">SALDO</span>
              <span className="text-xl font-extrabold text-indigo-800">
                {formatCurrency(totalSaldo)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* -------------------- 3. GASTOS TOTALES POR MES (NUEVO REQUISITO) -------------------- */}
      <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-xl font-bold text-gray-900 mb-6 text-center border-b pb-2">
              GASTOS TOTALES POR MES (Detalle)
          </h4>
          
          {/* Cuadrícula de 12 Meses (4 columnas por fila) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {monthlyData.map((item) => (
                  <MonthlySummaryCard key={item.mes} data={item} />
              ))}
          </div>
      </div>
      
    </div>
  );
}