"use client";

import React from "react";

interface CrudPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const CrudPageLayout: React.FC<CrudPageLayoutProps> = ({ title, description, children }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="text-gray-600 mt-2">{description}</p>}
      </div>
      <div className="bg-white shadow rounded-lg p-6">{children}</div>
    </div>
  );
};

export default CrudPageLayout;
