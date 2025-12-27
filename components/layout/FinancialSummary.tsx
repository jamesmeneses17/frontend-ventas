// components/layout/FinancialSummary.tsx

import React, { useEffect, useState } from 'react';
import { getReporteAnual, getReporteDiario, ReporteAnualData, ReporteDiarioData } from '../services/cajaService';

// --- INTERFACES DE DATOS ---
// Usamos las importadas del servicio, pero alias local si se quiere mantener compatibilidad visual
type MonthlyData = ReporteAnualData;
type DailyData = ReporteDiarioData;

// --- CÁLCULOS Y FUNCIONES DE FORMATO ---
const formatCurrency = (value: number) => `$${Number(value).toLocaleString('es-CO')}`;

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

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
  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth(); // 0-11

  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);

  // Estado para el filtro de mes (guardamos el nombre del mes para visualización, o el índice + 1)
  // Guardaremos el index+1 (1-12) para facilitar la query
  const [selectedMonthNum, setSelectedMonthNum] = useState<number>(currentMonthIndex + 1);

  // Cargar reporte anual al montar
  useEffect(() => {
    const loadAnnual = async () => {
      const data = await getReporteAnual(currentYear);
      setMonthlyData(data);

      // Si el mes seleccionado no está en la data anual cargada, cambiar al primero disponible?
      // O mantener el actual si estamos en el mes corriente.
      // Dejaremos la lógica simple: si hay datos y currentMonth no tiene nada, quizás cambiar.
      // Pero el usuario quiere filtrar.
    };
    loadAnnual();
  }, [currentYear]);

  // Cargar reporte diario cuando cambia el mes seleccionado o el año
  useEffect(() => {
    const loadDaily = async () => {
      const data = await getReporteDiario(currentYear, selectedMonthNum);
      // Mapear el nombre del mes si no viene del backend (nuestro back lo manda vacío en diario)
      const mappedData = data.map(d => ({
        ...d,
        mes: MESES[selectedMonthNum - 1]
      }));
      setDailyData(mappedData);
    };
    loadDaily();
  }, [currentYear, selectedMonthNum]);


  // Calculos totales anuales
  const totalIngresos = monthlyData.reduce((sum, item) => sum + Number(item.ingresos), 0);
  const totalEgresos = monthlyData.reduce((sum, item) => sum + Number(item.egresos), 0);
  const totalGastos = monthlyData.reduce((sum, item) => sum + Number(item.gastos), 0);
  const totalSaldo = totalIngresos - totalEgresos - totalGastos;

  // Obtener nombre del mes seleccionado para display
  const selectedMonthName = MESES[selectedMonthNum - 1];

  return (
    <div className="bg-white shadow-xl rounded-2xl border border-gray-300 p-6">

      <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 text-center bg-gray-100 rounded-md py-2">
        RESUMEN DIARIO MENSUAL Y ANUAL {currentYear}
      </h3>

      {/* -------------------- 1. RESUMEN DIARIO (Con Filtro) -------------------- */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h4 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">RESUMEN DIARIO</h4>

        {/* --- Filtros --- */}
        <div className="flex items-center space-x-4 mb-4">
          <label htmlFor="month-filter" className="text-sm font-medium text-gray-700">Filtrar por Mes:</label>
          <select
            id="month-filter"
            value={selectedMonthNum}
            onChange={(e) => setSelectedMonthNum(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {/* Mostrar todos los meses para permitir navegar, o solo los disponibles? 
                Usuario dijo: "tomar los valores de movimientos aparecer esas fechas nomas que le al bde"
                Interpretación: En el reporte anual solo aparecen meses con datos.
                En el filtro diario, ¿debería poder elegir cualquier mes? 
                Lo ideal es que pueda elegir cualquier mes para ver que está vacío, o solo los que tienen datos.
                Voy a listar todos los meses del año para ser práctico (un dropdown incompleto se ve raro).
            */}
            {MESES.map((mes, idx) => (
              <option key={idx} value={idx + 1}>{mes}</option>
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
              {dailyData.map((item, index) => (
                <tr key={index}>
                  {/* Formatear fecha para que se vea bonita (quitar hora si viene) */}
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                    {item.fecha ? new Date(item.fecha).toLocaleDateString('es-CO') : ''}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{item.mes}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-green-600">{formatCurrency(item.ingreso)}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-red-600">{formatCurrency(item.egreso)}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-red-600">{formatCurrency(item.gasto)}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.saldo)}
                  </td>
                </tr>
              ))}
              {dailyData.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">No hay movimientos registrados para {selectedMonthName}.</td>
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
              {monthlyData.length > 0 ? monthlyData.map((item) => (
                <tr key={item.mes}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.mes}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">{formatCurrency(item.ingresos)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">{formatCurrency(item.egresos)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">{formatCurrency(item.gastos)}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                    {formatCurrency(item.saldo)}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="text-center py-4 text-gray-500">No hay datos anuales registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totales Anuales (Dynamics) */}
        <div className="mt-6 border-t pt-4">
          <h4 className="text-xl font-bold text-orange-600 mb-4 text-center">
            TOTALES DEL AÑO {currentYear}
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

        {/* Cuadrícula de Meses con data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {monthlyData.length > 0 ? monthlyData.map((item) => (
            <MonthlySummaryCard key={item.mes} data={item} />
          )) : (
            <p className="col-span-4 text-center text-gray-500">No hay datos para mostrar.</p>
          )}
        </div>
      </div>

    </div>
  );
}