// /components/layout/PublicLayout.tsx (MODIFICADO)

"use client";

import React, { ReactNode } from "react";
import HeaderPublic from "./HeaderPublic";
import FooterPublic from "./FooterPublic";
import BrandingBarSection from "../ui/BrandingBarSection";
// import AlliedBrandsSection from "../ui/AlliedBrandsSection"; // Se mantiene comentado si no se usa

interface PublicLayoutProps {
    children: ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
    return (
<div className="min-h-screen bg-white pt-24 -mb-24">            {/* 1. Navbar público (fixed top-0) */}
            <HeaderPublic />

            {/* 2. Barra de movimiento en flujo normal (no fija) */}
            <BrandingBarSection />

            {/* 3. Contenido principal sin relleno extra */}
            {/* CAMBIO: Usamos 'py-0' (padding-y: 0) o 'p-0' para asegurar que no haya relleno vertical */}
            <main className="p-0"> 
                {children}
            </main>

            <FooterPublic />
        </div>
    );
};

export default PublicLayout;