// /app/catalogos/page.tsx (o /pages/catalogos.tsx)

"use client";

import React, { useState } from 'react';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout';

// Componente para la tabla de Categorías (se define abajo)
const CategoriasTable = () => {
    // Datos de ejemplo basados en tu imagen (3A656C82-DC61-4A92-B6C7-6F46D7AA8436)
    const categorias = [
        { id: 1, nombre: 'Electronica', descripcion: 'Productos electrónicos', estado: 'Activo' },
        { id: 2, nombre: 'Ropa', descripcion: 'Prendas de vestir', estado: 'Activo' },
        { id: 3, nombre: 'Alimentos', descripcion: 'Productos alimenticios', estado: 'Activo' },
        { id: 4, nombre: 'Hogar', descripcion: 'Artículos para el hogar', estado: 'Activo' },
    ];

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Categorías</h3>
                <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Nueva Categoría
                </button>
            </div>

            {/* Barra de Búsqueda (Placeholder) */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar categorías..."
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categorias.map((categoria) => (
                            <tr key={categoria.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{categoria.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{categoria.nombre}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{categoria.descripcion}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${categoria.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {categoria.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-3" title="Editar">
                                        {/* Icono de lápiz (Editar) */}
                                        <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    <button className="text-red-600 hover:text-red-900" title="Eliminar">
                                        {/* Icono de papelera (Eliminar) */}
                                        <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default function CatalogosPage() {
    const TABS = [
        { name: 'Categorías', component: <CategoriasTable /> },
        { name: 'Subcategorías', component: <div className="py-8 text-center text-gray-500">Contenido de Subcategorías</div> },
        { name: 'Marcas', component: <div className="py-8 text-center text-gray-500">Contenido de Marcas</div> },
        { name: 'Unidades de Medida', component: <div className="py-8 text-center text-gray-500">Contenido de Unidades de Medida</div> },
        { name: 'Métodos de Pago', component: <div className="py-8 text-center text-gray-500">Contenido de Métodos de Pago</div> },
        { name: 'Tipos de Documento', component: <div className="py-8 text-center text-gray-500">Contenido de Tipos de Documento</div> },
    ];

    const [activeTab, setActiveTab] = useState(TABS[0].name);

    return (
        <AuthenticatedLayout>
            <div className="space-y-6">
                
                {/* Header (Título y Descripción) */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Catálogos</h1>
                    <p className="text-gray-600 mt-2">
                        Gestiona las configuraciones básicas del sistema
                    </p>
                </div>

                {/* Contenido Principal con Pestañas */}
                <div className="bg-white shadow rounded-lg p-6">
                    {/* Barra de Pestañas */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`
                                        ${activeTab === tab.name
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                                    `}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Contenido Dinámico de la Pestaña Activa */}
                    {TABS.find(tab => tab.name === activeTab)?.component}
                    
                    {/* El contenido que tenías antes (No hay productos) se reemplaza por la tabla, 
                        o podrías usar ese contenido como fallback si la lista está vacía. */}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}