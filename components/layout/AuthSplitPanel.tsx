"use client";

import Image from "next/image";
import React from "react";

interface AuthSplitPanelProps {
  children: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
}

export default function AuthSplitPanel({
  children,
  imageSrc = "/images/logodisem.jpg",
  imageAlt = "Imagen",
}: AuthSplitPanelProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        
       

        
        <div className="bg-white rounded-2xl shadow-md p-8 flex items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
        </div>
    </div>
  );
}