"use client";
import Sidebar from "../AdminSidebar/AdminSidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const DashboardLayout = ({ children, title, description }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #202020 0%, #181818 100%)" }}>
      <Sidebar />
      <div className="lg:ml-80 min-h-screen">
        <header 
          className="border-b border-gray-800 p-6"
          style={{ background: "linear-gradient(145deg, #1a1a1a, #2a2a2a)" }}
        >
          <div className="max-w-7xl mx-auto">
            {title && (
              <h1 className="text-3xl font-bold mb-2">
                <span style={{
                  background: "linear-gradient(135deg, #c4f44c, #d8ff6a)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  {title}
                </span>
              </h1>
            )}
            {description && (
              <p className="text-gray-400 text-lg">
                {description}
              </p>
            )}
          </div>
        </header>
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
