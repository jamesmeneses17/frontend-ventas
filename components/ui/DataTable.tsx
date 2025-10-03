"use client";

import { ReactNode } from "react";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: (row: T) => ReactNode;
}

export default function DataTable<T>({
  data,
  columns,
  actions,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-6 py-4 whitespace-nowrap">
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key])}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-6 py-4 text-center text-gray-500"
              >
                No hay datos para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
