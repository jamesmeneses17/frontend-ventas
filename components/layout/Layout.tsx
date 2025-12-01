"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      
      <div
        className={`fixed inset-y-0 left-0 z-40 w-56 transform bg-gray-800 transition duration-300 ease-in-out md:flex md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:ml-56 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}