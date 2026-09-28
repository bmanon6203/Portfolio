"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useState, useEffect } from "react";

const AdminSidebar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 800);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const sidebarStyle = {
    width: isMobile ? (open ? "220px" : "0") : "250px",
    minWidth: isMobile ? (open ? "220px" : "0") : "250px",
    maxWidth: isMobile ? (open ? "220px" : "0") : "250px",
    background: "#202020",
    borderRight: "2px solid #333",
    padding: open || !isMobile ? "2rem 1rem" : "0",
    zIndex: 2000,
    position: "fixed",
    color: "#fff",
    height: "100vh",
    top: 0,
    left: 0,
    transition: "all 0.3s cubic-bezier(.4,2,.6,1)",
    overflow: "hidden",
    boxShadow: isMobile && open ? "2px 0 16px 0 #0008" : "none",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <>
      {isMobile && (
        <button
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((o) => !o)}
          style={{
            position: "fixed",
            top: 18,
            left: 18,
            zIndex: 2100,
            background: "rgba(32,32,32,0.95)",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "#c4f44c",
            width: 45,
            height: 45,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            boxShadow: "0 2px 8px #0006",
            cursor: "pointer",
            padding: 0,
            lineHeight: 1,
            textAlign: "center",
            verticalAlign: "middle",
            userSelect: "none",
            transform: "skew(-6deg)",
          }}
        >
          {open ? (
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.99486 7.00636C6.60433 7.39689 6.60433 8.03005 6.99486 8.42058L10.58 12.0057L6.99486 15.5909C6.60433 15.9814 6.60433 16.6146 6.99486 17.0051C7.38538 17.3956 8.01855 17.3956 8.40907 17.0051L11.9942 13.4199L15.5794 17.0051C15.9699 17.3956 16.6031 17.3956 16.9936 17.0051C17.3841 16.6146 17.3841 15.9814 16.9936 15.5909L13.4084 12.0057L16.9936 8.42059C17.3841 8.03007 17.3841 7.3969 16.9936 7.00638C16.603 6.61585 15.9699 6.61585 15.5794 7.00638L11.9942 10.5915L8.40907 7.00636C8.01855 6.61584 7.38538 6.61584 6.99486 7.00636Z"
                fill="#c4f44c"
              />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 18H10"
                stroke="#c4f44c"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M4 12L16 12"
                stroke="#c4f44c"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M4 6L20 6"
                stroke="#c4f44c"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      )}
      <div style={sidebarStyle}>
        {(open || !isMobile) && (
          <>
            <nav>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    href="/admin/create"
                    style={{
                      display: "block",
                      position: "relative",
                      padding: "0.75rem 1rem",
                      color: pathname === "/admin/create" ? "#c4f44c" : "#fff",
                      textDecoration: "none",
                      background:
                        pathname === "/admin/create"
                          ? "rgba(196, 244, 76, 0.1)"
                          : "transparent",
                      border:
                        pathname === "/admin/create"
                          ? "1px solid rgba(196, 244, 76, 0.3)"
                          : "1px solid transparent",
                      borderRadius: "8px",
                      fontWeight: "500",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) => {
                      if (pathname !== "/admin/create") {
                        e.target.style.background = "#303030";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (pathname !== "/admin/create") {
                        e.target.style.background = "transparent";
                      }
                    }}
                    >
                    Créer
                    {pathname.includes("/admin/create") && (
                      <div
                      style={{
                        position: "absolute",
                        top: "-1rem",
                        right: "8px",
                        width: "40px",
                        height: "40px",
                        background: "rgba(196, 244, 76, 0.1)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "8px",
                        border: "1px solid rgba(196, 244, 76, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow:
                        "0 4px 15px rgba(196, 244, 76, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                        transform: "skew(-6deg)",
                      }}
                      >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="none"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="12" y1="11" x2="12" y2="17"></line>
                        <line x1="9" y1="14" x2="15" y2="14"></line>
                      </svg>
                      </div>
                    )}
                    </Link>
                  </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    href="/admin/edit-profile"
                    style={{
                      display: "block",
                      position: "relative",
                      padding: "0.75rem 1rem",
                      color: pathname === "/admin/edit-profile" ? "#c4f44c" : "#fff",
                      textDecoration: "none",
                      background:
                        pathname === "/admin/edit-profile"
                          ? "rgba(196, 244, 76, 0.1)"
                          : "transparent",
                      border:
                        pathname === "/admin/edit-profile"
                          ? "1px solid rgba(196, 244, 76, 0.3)"
                          : "1px solid transparent",
                      borderRadius: "8px",
                      fontWeight: "500",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) => {
                      if (pathname !== "/admin/edit-profile") {
                        e.target.style.background = "#303030";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (pathname !== "/admin/edit-profile") {
                        e.target.style.background = "transparent";
                      }
                    }}
                  >
                    Profil
                  </Link>
                </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <Link
                    href="/admin/edit"
                    style={{
                      display: "block",
                      position: "relative",
                      padding: "0.75rem 1rem",
                      color: pathname === "/admin/edit" ? "#c4f44c" : "#fff",
                      textDecoration: "none",
                      background:
                        pathname === "/admin/edit"
                          ? "rgba(196, 244, 76, 0.1)"
                          : "transparent",
                      border:
                        pathname === "/admin/edit"
                          ? "1px solid rgba(196, 244, 76, 0.3)"
                          : "1px solid transparent",
                      borderRadius: "8px",
                      fontWeight: "500",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) => {
                      if (pathname !== "/admin/edit") {
                        e.target.style.background = "#303030";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (pathname !== "/admin/edit") {
                        e.target.style.background = "transparent";
                      }
                    }}
                  >
                    Modifier
                    {pathname === "/admin/edit" && (
                      <div
                      style={{
                        position: "absolute",
                        top: "-1rem",
                        right: "8px",
                        width: "40px",
                        height: "40px",
                        background: "rgba(196, 244, 76, 0.1)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "8px",
                        border: "1px solid rgba(196, 244, 76, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow:
                        "0 4px 15px rgba(196, 244, 76, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                        color: "#c4f44c",
                        transform: "skew(-6deg)",
                      }}
                      >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ display: "block", margin: "auto" }}
                      >
                        <path
                        d="M14.7566 2.62145C16.5852 0.792851 19.55 0.792851 21.3786 2.62145C23.2072 4.45005 23.2072 7.41479 21.3786 9.24339L11.8933 18.7287C11.3514 19.2706 11.0323 19.5897 10.6774 19.8665C10.2592 20.1927 9.80655 20.4725 9.32766 20.7007C8.92136 20.8943 8.49334 21.037 7.76623 21.2793L4.43511 22.3897L3.63303 22.6571C2.98247 22.8739 2.26522 22.7046 1.78032 22.2197C1.29542 21.7348 1.1261 21.0175 1.34296 20.367L2.72068 16.2338C2.96303 15.5067 3.10568 15.0787 3.29932 14.6724C3.52755 14.1935 3.80727 13.7409 4.13354 13.3226C4.41035 12.9677 4.72939 12.6487 5.27137 12.1067L14.7566 2.62145ZM4.40051 20.8201L7.24203 19.8729C8.03314 19.6092 8.36927 19.4958 8.68233 19.3466C9.06287 19.1653 9.42252 18.943 9.75492 18.6837C10.0284 18.4704 10.2801 18.2205 10.8698 17.6308L18.4393 10.0614C17.6506 9.78321 16.6346 9.26763 15.6835 8.31651C14.7324 7.36538 14.2168 6.34939 13.9387 5.56075L6.36917 13.1302C5.77951 13.7199 5.52959 13.9716 5.3163 14.2451C5.05704 14.5775 4.83476 14.9371 4.65341 15.3177C4.50421 15.6307 4.3908 15.9669 4.12709 16.758L3.17992 19.5995L4.40051 20.8201ZM15.1554 4.34404C15.1896 4.519 15.2474 4.75684 15.3438 5.03487C15.561 5.66083 15.9712 6.48288 16.7442 7.25585C17.5171 8.02881 18.3392 8.43903 18.9651 8.6562C19.2432 8.75266 19.481 8.81046 19.656 8.84466L20.3179 8.18272C21.5607 6.93991 21.5607 4.92492 20.3179 3.68211C19.0751 2.4393 17.0601 2.4393 15.8173 3.68211L15.1554 4.34404Z"
                        fill="currentColor"
                        />
                      </svg>
                      </div>
                    )}
                    </Link>
                  </li>
                  </ul>
                </nav>
                <div
                  style={{
                  marginTop: "2rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #333",
                  }}
                >
                  <Link
                  href="/"
                  style={{
                    display: "block",
                    padding: "0.75rem 1rem",
                    color: "#888",
                    textDecoration: "none",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    transition: "color 0.2s",
                  }}
                  onMouseOver={(e) => {
                  e.target.style.color = "#fff";
                }}
                onMouseOut={(e) => {
                  e.target.style.color = "#888";
                }}
              >
                ← Retour à l'accueil
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminSidebar;
