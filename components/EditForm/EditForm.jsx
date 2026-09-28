"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../DynamicForm/DynamicForm.module.css";
import { editFormFields, editFormConfig } from "../../config/formConfig";

const EditForm = ({ 
  initialData = {}, 
  onSave, 
  onCancel,
  fields = editFormFields,
  config = editFormConfig
}) => {
  const [formData, setFormData] = useState({});
  const [photoFiles, setPhotoFiles] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const totalSteps = fields.length;

  useEffect(() => {
    const completeFormData = {};
    
    fields.forEach(field => {
      completeFormData[field.name] = initialData[field.name] || '';
    });
    
    setFormData(completeFormData);
    
    if (initialData.photos && Array.isArray(initialData.photos)) {
      setExistingPhotos(initialData.photos);
    }
  }, [initialData, fields]);

  useEffect(() => {
    const hasDataChanged = Object.keys(formData).some(key => {
      if (key === 'photos') {
        return photoFiles.length > 0 || existingPhotos.length !== (initialData.photos || []).length;
      }
      const originalValue = initialData[key] || '';
      const currentValue = formData[key] || '';
      return currentValue !== originalValue;
    });
    setHasChanges(hasDataChanged);
  }, [formData, photoFiles, existingPhotos, initialData]);

  const handleChange = (e, name) => {
    const fieldName = name || e.target.name;
    
    if (fieldName === "photos" || e.target.type === "file") {
      const files = Array.from(e.target.files);
      console.log("Files selected:", files.length, files);
      if (files.length > 0) {
        const newPhotoFiles = [...photoFiles, ...files];
        setPhotoFiles(newPhotoFiles);
        setFormData({ ...formData, [fieldName]: newPhotoFiles });
        console.log("Updated photoFiles:", newPhotoFiles);
      }
    } else if (e.target.type === "checkbox") {
      setFormData({ ...formData, [fieldName]: e.target.checked });
    } else {
      const fieldValue = e.target.value;
      setFormData({ ...formData, [fieldName]: fieldValue });
    }
  };

  const handleAddPhoto = () => {
    document.getElementById("add-photo-input").click();
  };

  const handleRemovePhoto = (idx) => {
    const newFiles = photoFiles.filter((_, i) => i !== idx);
    setPhotoFiles(newFiles);
    setFormData({ ...formData, photos: newFiles });
  };

  const handleRemoveExistingPhoto = (idx) => {
    const newExisting = existingPhotos.filter((_, i) => i !== idx);
    setExistingPhotos(newExisting);
  };

  const handleExtraPhoto = (e) => {
    const files = Array.from(e.target.files);
    setPhotoFiles(prev => [...prev, ...files]);
    setFormData({ ...formData, photos: [...photoFiles, ...files] });
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const renderField = (field) => {
    const { name, type, required } = field;
    const value = formData[name] || "";

    switch (type) {
      case "select":
        const options = config?.selectOptions?.[name] || [];
        return (
          <select
            name={name}
            value={value}
            onChange={(e) => handleChange(e, name)}
            required={required}
            className={styles["form-input"]}
            autoFocus
          >
            <option value="">Sélectionnez...</option>
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case "textarea":
        return (
          <textarea
            name={name}
            value={value}
            onChange={(e) => handleChange(e, name)}
            required={required}
            className={styles["form-input"]}
            placeholder={field.placeholder || field.label}
            rows={4}
            autoFocus
          />
        );
      
      case "file":
        return (
          <div
            style={{
              border: "2px dashed #c4f44c",
              borderRadius: 12,
              padding: "18px 12px 12px 12px",
              background: "rgba(196,244,76,0.07)",
              marginBottom: 16,
              position: "relative",
              minHeight: 80,
              textAlign: "left",
            }}
          >
            <input
              className={styles["form-input"]}
              type="file"
              name={name}
              id={`file-input-${name}`}
              onChange={(e) => {
                handleChange(e, name);
                e.target.value = '';
              }}
              multiple={field.multiple}
              accept={field.accept || "image/*"}
              style={{ display: "none" }}
            />
            
            {name === "photos" && existingPhotos.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ color: "#c4f44c", fontSize: "0.9rem", marginBottom: 8 }}>Photos existantes :</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-start" }}>
                  {existingPhotos.map((photo, index) => (
                    <div key={`existing-${index}`} style={{
                      position: "relative",
                      width: 70,
                      height: 70,
                      borderRadius: 8,
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      background: "#fff",
                    }}>
                      <img
                        src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
                        alt={`Photo existante ${index + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingPhoto(index)}
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          background: "rgba(0,0,0,0.7)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          cursor: "pointer",
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {name === "photos" && photoFiles.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ color: "#c4f44c", fontSize: "0.9rem", marginBottom: 8 }}>Nouvelles photos :</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-start" }}>
                  {photoFiles.map((file, index) => (
                    <div key={`new-${index}`} style={{
                      position: "relative",
                      width: 70,
                      height: 70,
                      borderRadius: 8,
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      background: "#fff",
                      border: "2px solid #c4f44c"
                    }}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          background: "rgba(0,0,0,0.7)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          cursor: "pointer",
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        ✕
                      </button>
                      <div style={{
                        position: "absolute",
                        bottom: 2,
                        left: 2,
                        background: "#c4f44c",
                        color: "#222",
                        borderRadius: 3,
                        padding: "2px 4px",
                        fontSize: "9px",
                        fontWeight: "bold"
                      }}>
                        NEW
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button
              type="button"
              onClick={() => document.getElementById(`file-input-${name}`).click()}
              style={{
                background: "#c4f44c",
                color: "#222",
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 2px 8px rgba(196,244,76,0.2)"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#d8ff6a";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#c4f44c";
                e.target.style.transform = "translateY(0)";
              }}
            >
              📷 {name === "photos" && (existingPhotos.length > 0 || photoFiles.length > 0) 
                ? "Ajouter d'autres photos" 
                : "Ajouter des photos"}
            </button>
          </div>
        );
      
      default:
        return (
          <input
            type={type || "text"}
            name={name}
            value={value}
            onChange={(e) => handleChange(e, name)}
            required={required}
            className={styles["form-input"]}
            placeholder={field.placeholder || field.label}
            autoComplete="off"
            autoFocus
          />
        );
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setIsLoading(true);
    
    try {
      const data = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "photos" && Array.isArray(photoFiles)) {
          photoFiles.forEach((file) => {
            data.append("newPhotos", file);
          });
        } else if (value !== undefined) {
          data.append(key, value);
        }
      });
      
      data.append("existingPhotos", JSON.stringify(existingPhotos));
      
      if (onSave) {
        await onSave(data);
      } else {
        const response = await fetch("/api/update", {
          method: "PUT",
          body: data,
        });
        if (!response.ok) throw new Error("Erreur serveur");
        alert("Modifications sauvegardées !");
      }
      
    } catch (err) {
      alert("Erreur lors de la sauvegarde : " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirm = window.confirm("Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?");
      if (!confirm) return;
    }
    
    if (onCancel) {
      onCancel();
    } else {
      window.history.back();
    }
  };

  const maxVisible = 3;
  let firstVisible = 0;
  let lastVisible = Math.min(fields.length, maxVisible);

  if (step === 0) {
    firstVisible = 0;
    lastVisible = Math.min(fields.length, maxVisible);
  } else if (step === fields.length - 1) {
    firstVisible = Math.max(0, fields.length - maxVisible);
    lastVisible = fields.length;
  } else {
    firstVisible = Math.max(0, step - 1);
    lastVisible = Math.min(fields.length, firstVisible + maxVisible);
  }
  const visibleSteps = fields.slice(firstVisible, lastVisible);
  const stepsAfter = fields.length - lastVisible;

  return (
    <div className={styles.fullscreen}>
      <button
        onClick={handleCancel}
        className={styles.backHomeBtn}
        aria-label="Annuler les modifications"
      >
        <svg width="28" height="20" viewBox="0 0 28 28" fill="none">
          <path
            d="M18 24L10 14L18 4"
            stroke="#c4f44c"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className={styles["form-wrapper"]}>

        <div className={styles.stepper}>
          {visibleSteps.map((field, idx) => {
            const realIdx = firstVisible + idx;
            return (
              <div
                key={field.name}
                className={styles.step}
                style={{ position: "relative" }}
              >
                <div
                  className={`${styles["step-dot"]} ${
                    realIdx === step
                      ? styles["step-dot"] + " " + styles["active"]
                      : realIdx < step
                      ? styles["step-dot"] + " " + styles["completed"]
                      : ""
                  }`}
                >
                  {realIdx + 1}
                </div>
                <div
                  className={`${styles["step-label"]} ${
                    realIdx === step ? styles["active"] : ""
                  }`}
                >
                  {field.label}
                </div>

                {idx === visibleSteps.length - 1 && stepsAfter > 0 && (
                  <span className={styles.moreSteps}>+{stepsAfter}</span>
                )}
              </div>
            );
          })}
        </div>

        {fields[step].description && (
          <div
            style={{
              margin: "0 0 4vh 0",
              fontWeight: "300",
              fontSize: "1.08rem",
              color: "var(--color-label-active)",
              opacity: 0.85,
              textAlign: "left",
            }}
          >
            {fields[step].description}
          </div>
        )}

        {hasChanges && (
          <div
            style={{
              margin: "0 0 2vh 0",
              padding: "8px 16px",
              background: "rgba(196,244,76,0.1)",
              border: "1px solid rgba(196,244,76,0.3)",
              borderRadius: "8px",
              color: "#c4f44c",
              fontSize: "0.9rem",
              textAlign: "left",
            }}
          >
            ✓ Modifications détectées
          </div>
        )}

        <form
          className={styles["form-card"]}
          onSubmit={(e) => {
            e.preventDefault(); 
          }}
          autoComplete="off"
        >
          <label
            className={styles["form-label"]}
            htmlFor={fields[step].name}
            style={{
              display: "flex",
              justifyContent: "end",
              alignItems: "end",
              width: "100%",
            }}
          >
            {fields[step].required && (
              <span
                style={{
                  color: "#c4f44c",
                  marginLeft: 4,
                  fontSize: 10,
                }}
              >
                (Requis)
              </span>
            )}
          </label>

          {renderField(fields[step])}

          <div className={styles["form-actions"]}>
            <button
              type="button"
              className={styles["form-btn"]}
              onClick={handlePrev}
              disabled={step === 0}
              aria-label="Précédent"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M14 18L8 11L14 4"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {step < totalSteps - 1 ? (
              <button
                type="button"
                className={styles["form-btn"]}
                onClick={handleNext}
                aria-label="Suivant"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path
                    d="M8 4L14 11L8 18"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                className={styles["form-btn"]}
                disabled={isLoading || (!hasChanges)}
                onClick={handleSubmit}
                style={{
                  background: hasChanges 
                    ? "var(--color-btn-bg)" 
                    : "var(--color-btn-disabled-bg)",
                  color: hasChanges 
                    ? "var(--color-btn-text)" 
                    : "var(--color-btn-disabled-text)",
                }}
              >
                {isLoading ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditForm;
