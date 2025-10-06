"use client";
import React from 'react';
import HeroSection from '../components/ui/HeroSection'; 
import CategorySection from '../components/ui/CategorySection'; 

export default function HomePage() {
  return (
    // 🚨 ELIMINAMOS PublicLayout
    <>
      {/* 1. SECCIÓN PRINCIPAL (HERO) */}
      <HeroSection />
      
      {/* 2. SECCIÓN DE CATEGORÍAS - Ahora CategorySection debe usar useCategories() */}
      <CategorySection />
    </>
  );
}