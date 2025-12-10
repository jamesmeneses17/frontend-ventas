"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* Sidebar - se contrae en desktop, overlay en mobile */}
      {isSidebarOpen && (
        <div className="w-56 bg-gray-800 transition-all duration-300 ease-in-out overflow-hidden fixed inset-y-0 left-0 z-40 md:relative md:inset-auto">
          <div className="w-56 h-full overflow-y-auto hide-scrollbar">
            <Sidebar />
          </div>
        </div>
      )}

      
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}