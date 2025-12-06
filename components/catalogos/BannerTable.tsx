"use client";

import React from "react";
import Image from "next/image";
import ActionButton from "../common/ActionButton";
import { Banner } from "../../types/configuracion";

interface Props {
  data: Banner[];
  loading?: boolean;
  onEdit: (item: Banner) => void;
  onDelete: (id: number) => void;
}

export default function BannerTable({ data, loading, onEdit, onDelete }: Props) {
  if (loading) return <p className="text-sm text-gray-600">Cargando banners...</p>;

  if (!data || data.length === 0) return <p className="text-sm text-gray-600">No hay banners para mostrar.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Imagen</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Título</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subtítulo</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Orden</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Activo</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-2 w-28">
                {item.urlImagen ? (
                  <div className="w-24 h-12 relative rounded overflow-hidden bg-gray-100">
                    <Image src={item.urlImagen} alt={item.titulo || 'banner'} fill style={{ objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div className="w-24 h-12 bg-gray-100 rounded" />
                )}
              </td>
              <td className="px-4 py-2 align-top">{item.titulo}</td>
              <td className="px-4 py-2 align-top">{item.subtitulo}</td>
              <td className="px-4 py-2 align-top">{item.orden ?? 0}</td>
              <td className="px-4 py-2 align-top">{item.activo ? 'Sí' : 'No'}</td>
              <td className="px-4 py-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <ActionButton icon="edit" label="Editar" onClick={() => onEdit(item)} />
                  <ActionButton icon="delete" label="Eliminar" onClick={() => onDelete(item.id!)} color="danger" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
