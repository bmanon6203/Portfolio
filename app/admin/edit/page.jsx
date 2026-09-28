"use client";

import { useState, useEffect } from "react";
import styles from "../../../components/DynamicForm/DynamicForm.module.css";

export default function EditPage() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/entries");
      if (response.ok) {
        const result = await response.json();
        const data = result.success ? result.data : [];
        setEntries(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch entries");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching entries:", err);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEntries(entries.filter((entry) => entry._id !== id));
      } else {
        throw new Error("Failed to delete entry");
      }
    } catch (err) {
      setError("Erreur lors de la suppression");
      console.error("Error deleting entry:", err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#181818",
        padding: "2rem",
        color: "white",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          marginLeft: "50px",
        }}
      >
        {isLoading && (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 0",
              color: "#888",
            }}
          >
            <div
              style={{
                display: "inline-block",
                width: "40px",
                height: "40px",
                border: "3px solid #333",
                borderTop: "3px solid #c4f44c",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p style={{ marginTop: "1rem" }}>Chargement des entrées...</p>
          </div>
        )}

        {error && (
          <div
            style={{
              background: "#dc2626",
              color: "white",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "2rem",
            }}
          >
            <p>
              <strong>Erreur:</strong> {error}
            </p>
          </div>
        )}

        {!isLoading && !error && (
          <div>
            {entries.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "4rem 2rem",
                  background: "#202020",
                  border: "2px dashed #333",
                  borderRadius: "12px",
                }}
              >
                <p style={{ color: "#888", fontSize: "1.1rem" }}>
                  Aucune entrée trouvée
                </p>
                <p style={{ color: "#666", fontSize: "0.9rem" }}>
                  Les formulaires soumis apparaîtront ici
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                }}
              >
                {entries.map((entry, index) => (
                  <div
                    key={entry._id || index}
                    style={{
                      background: "#202020",
                      border: "1px solid #333",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <div style={{ marginBottom: "1rem" }}>
                      <h3
                        style={{
                          color: "#c4f44c",
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {entry.title || entry.email || "Entrée sans nom"}
                      </h3>
                      {entry.lastName && (
                        <p style={{ color: "#888", fontSize: "0.9rem" }}>
                          {entry.lastName}
                        </p>
                      )}
                      {entry.email && (
                        <p style={{ color: "#888", fontSize: "0.9rem" }}>
                          {entry.email}
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        justifyContent: "space-between",
                      }}
                    >
                      <button
                        onClick={() =>
                          window.open(`/admin/edit/${entry._id}`, "_blank")
                        }
                        style={{
                          background: "var(--color-btn-bg)",
                          border: "none",
                          borderRadius: "8px",
                          color: "var(--color-btn-text)",
                          padding: "0.5rem 1rem",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "background 0.2s",
                          transform: "skew(-5deg)",
                        }}
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => deleteEntry(entry._id)}
                        style={{
                          background: "#dc2626",
                          border: "none",
                          borderRadius: "8px",
                          color: "white",
                          padding: "0.5rem 1rem",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "background 0.2s",
                          transform: "skew(-5deg)",
                        }}
                      >
                        Supprimer
                      </button>
                    </div>

                    {entry.createdAt && (
                      <div
                        style={{
                          marginTop: "1rem",
                          paddingTop: "1rem",
                          borderTop: "1px solid #333",
                          color: "#666",
                          fontSize: "0.8rem",
                        }}
                      >
                        Créé le:{" "}
                        {new Date(entry.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
