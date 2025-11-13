// /components/layout/PublicLayout.tsx (MODIFICADO)

"use client";

import React, { ReactNode } from 'react';
import HeaderPublic from './HeaderPublic'; 
// 👈 Importa el nuevo componente Footer
import FooterPublic from './FooterPublic'; 
import AlliedBrandsSection from '../ui/AlliedBrandsSection';

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
	return (
		<div className="min-h-screen bg-white"> 
			{/* 1. Navbar público */}
			<HeaderPublic /> 

			{/* 2. Contenido principal de la página */}
			{/* Añadimos padding-top igual a la altura del header (h-24) para compensar el header fixed */}
			<main className="pt-24">
				{/* 🚀 ¡NUEVA SECCIÓN DE MARCAS AQUÍ! */}
				<AlliedBrandsSection />
								{children}
			</main>

			{/* 🛑 3. Footer Completo (Reemplazado) */}
			<FooterPublic />
		</div>
	);
};

export default PublicLayout;