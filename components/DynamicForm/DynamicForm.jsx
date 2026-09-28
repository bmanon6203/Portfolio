"use client";
import React, { useState } from "react";
import Link from "next/link";
import styles from "./DynamicForm.module.css";
import { defaultFormConfig } from "../../config/default.formConfig.js";
import { formFields as defaultFormFields, selectOptions } from "../../config/formConfig";
const DynamicForm = ({ 
  fields = defaultFormFields,
  config = defaultFormConfig,
  onSubmitSuccess,
  onSubmitError 
}) => {
  const initialFormData = React.useMemo(() => {
    const obj = {};
    fields.forEach(f => {
      if (f.type === "checkbox") {
        obj[f.name] = false;
      } else {
        obj[f.name] = "";
      }
    });
    return obj;
  }, [fields]);
  const [formData, setFormData] = useState(initialFormData);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [step, setStep] = useState(0);
  const [accessCode, setAccessCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(!config.requireAccessCode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = fields.length;

  const handleChange = (e, name) => {
    const field = fields.find(f => f.name === name);
    
    if (field?.type === "file") {
      const files = Array.from(e.target.files);
      setPhotoFiles(files);
      setFormData({ ...formData, [name]: files });
    } else if (e.target.type === "checkbox") {
      setFormData({ ...formData, [name]: e.target.checked });
    } else {
      setFormData({ ...formData, [name]: e.target.value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      

      fields.forEach(field => {
        let value = formData[field.name];
        if (field.type === "file" && Array.isArray(photoFiles)) {
          if (photoFiles.length > 0) {
            photoFiles.forEach((file) => {
              data.append(field.name, file);
            });
          } else {
            data.append(field.name, "");
          }
        } else if (field.type === "checkbox") {
          data.append(field.name, value === true ? "true" : "false");
        } else {e
          data.append(field.name, value !== undefined && value !== null ? value : "");
        }
      });

      const response = await fetch(config.submitEndpoint, {
        method: "POST",
        body: data,
      });
      
      if (!response.ok) throw new Error("Erreur serveur");
      
      const result = await response.json();
      
      if (result.success) {
        if (onSubmitSuccess) {
          onSubmitSuccess(result);
        } else {
          alert("Formulaire envoyé avec succès !");
        }
        
        if (config.resetOnSuccess) {
          setFormData({});
          setPhotoFiles([]);
          setStep(0);
        }
      } else {
        throw new Error(result.message || "Erreur lors de l'envoi");
      }
    } catch (err) {
      console.error("Erreur:", err);
      if (onSubmitError) {
        onSubmitError(err);
      } else {
        alert("Erreur lors de l'envoi : " + err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccessCode = (e) => {
    e.preventDefault();
    if (accessCode === config.accessCode) {
      setIsAuthorized(true);
    } else {
      alert("Code incorrect");
    }
  };

  const maxVisible = config.maxVisibleSteps;
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

  if (!isAuthorized && config.requireAccessCode) {
    return (
      <div className={config.disableFullscreen ? '' : styles.fullscreen}>
        <form
          className={styles["form-card"]}
          onSubmit={handleAccessCode}
          style={{ maxWidth: 400, margin: "10vh auto", textAlign: "left" }}
        >
          <label htmlFor="accessCode" style={{ fontWeight: 500, fontSize: "1.1rem" }}>
            Entrez le code d'accès
          </label>
          <input
            type="password"
            id="accessCode"
            value={accessCode}
            onChange={e => setAccessCode(e.target.value)}
            className={styles["form-input"]}
            style={{ margin: "2vh 0", textAlign: "left" }}
            autoFocus
          />
          <button type="submit" className={styles["form-btn"]}>
            Valider
          </button>
        </form>
      </div>
    );
  }

  const currentField = fields[step];

  return (
    
    <div className={config.disableFullscreen ? '' : styles.fullscreen}>
      
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

        {currentField.description && (
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
            {currentField.description}
          </div>
        )}
        {currentField.hint && (
          <pre
            style={{
              margin: "0 0 2vh 0",
              fontWeight: "400",
              fontSize: "0.6rem",
              color: "#c4f44c",
              background: "rgba(196,244,76,0.08)",
              borderRadius: 8,
              padding: "8px 14px",
              textAlign: "left",
            }}
          >
            {currentField.hint}
          </pre>
        )}

        <form
          className={styles["form-card"]}
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <label
            className={styles["form-label"]}
            htmlFor={currentField.name}
            style={{
              display: "flex",
              justifyContent: "end",
              alignItems: "end",
              width: "100%",
            }}
          >
            {currentField.required && (
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

          {renderField(currentField, formData, handleChange, photoFiles, {
            handleAddPhoto,
            handleRemovePhoto,
            handleExtraPhoto
          }, config)}

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
              <>
                {!currentField.required && !formData[currentField.name] ? (
                  <button
                    type="button"
                    className={styles["form-btn"]}
                    onClick={handleNext}
                    aria-label="Passer"
                    style={{
                      background: "transparent",
                      color: "#c4f44c",
                      border: "1.5px dashed #c4f44c",
                    }}
                  >
                    Passer
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles["form-btn"]}
                    onClick={handleNext}
                    disabled={
                      currentField.required && !formData[currentField.name]
                    }
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
                )}
              </>
            ) : (
              <button
                type="submit"
                className={styles["form-btn"]}
                disabled={
                  (currentField.required && !formData[currentField.name]) || 
                  isSubmitting
                }
              >
                {isSubmitting ? "Envoi..." : "Envoyer"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const renderField = (field, formData, handleChange, photoFiles, photoHandlers, config) => {
  const { handleAddPhoto, handleRemovePhoto, handleExtraPhoto } = photoHandlers;
  
  switch (field.type) {
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
            name={field.name}
            id={field.name}
            accept="image/png, image/jpeg"
            multiple={field.multiple}
            onChange={(e) => handleChange(e, field.name)}
            style={{ display: "none" }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "flex-start" }}>
            {photoFiles.length > 0 && photoFiles.map((file, idx) => (
              <div
                key={idx}
                style={{
                  position: "relative",
                  width: 70,
                  height: 70,
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 22,
                    height: 22,
                    cursor: "pointer",
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                  }}
                  aria-label="Supprimer la photo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={styles["form-btn"]}
            style={{
              marginTop: 14,
              fontSize: 15,
              padding: "7px 18px",
              background: "#c4f44c",
              color: "#222",
              border: "none",
              borderRadius: 8,
              fontWeight: 500,
              boxShadow: "0 1px 6px rgba(196,244,76,0.12)",
              transition: "background 0.2s",
            }}
            onClick={handleAddPhoto}
          >
            + Ajouter une photo
          </button>
          <input
            type="file"
            id="add-photo-input"
            style={{ display: "none" }}
            accept="image/png, image/jpeg"
            multiple
            onChange={handleExtraPhoto}
          />
        </div>
      );

    case "select":
      const options = field?.options;
          console.log(options)
      return (
        <select
          className={styles["form-input"]}
          name={field.name}
          id={field.name}
          value={formData[field.name] || ""}
          onChange={(e) => handleChange(e, field.name)}
          autoFocus
        >
          <option value="">Sélectionnez...</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case "textarea":
      return (
        <textarea
          className={styles["form-input"]}
          name={field.name}
          id={field.name}
          value={formData[field.name] || ""}
          onChange={(e) => handleChange(e, field.name)}
          rows={4}
          autoFocus
          placeholder={field.label}
        />
      );

    case "checkbox":
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            type="checkbox"
            name={field.name}
            id={field.name}
            checked={formData[field.name] || false}
            onChange={(e) => handleChange(e, field.name)}
            autoFocus
          />
          <label htmlFor={field.name} style={{ color: "var(--color-label)" }}>
            {field.label}
          </label>
        </div>
      );

    default:
      return (
        <input
          className={styles["form-input"]}
          type={field.type}
          name={field.name}
          id={field.name}
          value={formData[field.name] || ""}
          onChange={(e) => handleChange(e, field.name)}
          autoFocus
          placeholder={field.label}
        />
      );
  }
};

export default DynamicForm;
