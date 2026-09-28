"use client";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 800);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (pathname === "/admin" && data.authenticated) {
            router.replace("/admin/create");
          }
          if (pathname.startsWith("/admin") && pathname !== "/admin" && !data.authenticated) {
            router.replace("/admin");
          }
        });
    }
  }, [pathname]);

  const contentStyle = {
    flex: 1,
    minHeight: "100vh",
    background: "linear-gradient(135deg, #202020 0%, #181818 100%)",
    color: "#fff",
    marginLeft: isMobile ? "0" : "250px",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />
      <div style={contentStyle}>{children}</div>
    </div>
  );
};

export default AdminLayout;
