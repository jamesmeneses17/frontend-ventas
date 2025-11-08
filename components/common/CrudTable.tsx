"use client";

import React from "react";
import ActionButton from "./ActionButton";

interface Column {
  key: string;
  label: string;
  // optional custom renderer for the whole row
  render?: (row: any) => React.ReactNode;
}

interface CrudTableProps {
  columns?: Column[];
  data?: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  renderRowActions?: (row: any) => React.ReactNode;
  loading?: boolean;
}

const CrudTable: React.FC<CrudTableProps> = ({ columns = [], data = [], onEdit, onDelete, renderRowActions, loading = false }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                No hay registros.
              </td>
            </tr>
          ) : (
            data.map((row, idx) => {
              return (
              <tr key={row?.id ?? idx}>
              {columns.map((col) => {
                if (col.render) {
                  return (
                    <td
                      key={col.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {col.render(row)}
                    </td>
                  );
                }

                const cell = row?.[col.key];
                // If the cell is an object, try to display a sensible string
                const display = typeof cell === "string" || typeof cell === "number"
                  ? cell
                  : cell && typeof cell === "object"
                    ? // prefer common keys
                      (cell.nombre ?? cell.name ?? JSON.stringify(cell))
                    : "";

                return (
                  <td
                    key={col.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {display}
                  </td>
                );
              })}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                {renderRowActions ? (
                  renderRowActions(row)
                ) : (
                  <>
                    {onEdit && (
                      <ActionButton
                        icon={
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        }
                        onClick={() => onEdit(row)}
                        label="Editar"
                      />
                    )}
                    {onDelete && (
                      <ActionButton
                        icon={
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        }
                        onClick={() => onDelete(row)}
                        color="danger"
                        label="Eliminar"
                      />
                    )}
                  </>
                )}
              </td>
            </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CrudTable;
