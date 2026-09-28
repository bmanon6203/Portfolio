'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../../../components/DynamicForm/DynamicForm.module.css';

export default function EditEntryPage({ params }) {
  const [entry, setEntry] = useState(null);
  const [formData, setFormData] = useState({});
  const [photoFiles, setPhotoFiles] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/entries/${resolvedParams.id}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setEntry(result.data);
            setFormData(result.data);
            if (result.data.photos && Array.isArray(result.data.photos)) {
              setExistingPhotos(result.data.photos);
            }
          } else {
            throw new Error('Entrée non trouvée');
          }
        } else {
          throw new Error('Erreur lors du chargement');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntry();
  }, [params]);

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddPhoto = () => {
    document.getElementById("add-photo-input").click();
  };

  const handleRemovePhoto = (idx) => {
    const newFiles = photoFiles.filter((_, i) => i !== idx);
    setPhotoFiles(newFiles);
  };

  const handleRemoveExistingPhoto = (idx) => {
    const newExistingPhotos = existingPhotos.filter((_, i) => i !== idx);
    setExistingPhotos(newExistingPhotos);
  };

  const handleExtraPhoto = (e) => {
    const files = Array.from(e.target.files);
    setPhotoFiles(prev => [...prev, ...files]);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const resolvedParams = await params;
      await fetch(`/api/entries/${resolvedParams.id}`, { method: 'DELETE' });
      const form = new FormData();
      form.append('_id', resolvedParams.id);
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'photos' || key === '_id') return;
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          form.append(key, value);
        }
      });
      form.append('existingPhotos', JSON.stringify(existingPhotos));
      photoFiles.forEach((file) => {
        form.append('photos', file);
      });
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: form,
      });
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        setPhotoFiles([]);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        padding: '2rem',
        minHeight: '100vh',
        background: '#181818',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '3px solid #333',
            borderTop: '3px solid #c4f44c',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '1rem' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        minHeight: '100vh',
        background: '#181818',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Erreur</h1>
          <p style={{ marginBottom: '2rem' }}>{error}</p>
          <Link href="/admin/edit" style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #c4f44c, #4ade80)',
            color: '#000',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            display: 'inline-block'
          }}>
            ← Retour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '2rem',
      minHeight: '100vh',
      background: 'var(--color-bg, #181818)',
      color: 'var(--color-label, #fff)'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: 'var(--color-form-label, #c4f44c)',
            marginBottom: '0.5rem'
          }}>
            Modifier l'entrée
          </h1>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link 
              href="/admin/edit" 
              className={styles['form-btn']}
              style={{
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              ← Retour à la liste
            </Link>
          </div>
        </div>

        {success && (
          <div style={{
            background: '#202020',
            border: '2px solid #c6f1588e',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#c4f44c'
          }}>
            Entrée sauvegardée avec succès !
          </div>
        )}

        <div style={{
          background: 'var(--color-bg-alt, #202020)',
          border: '2px solid var(--color-input-border, #333)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              className={styles['form-label']}
              style={{
                display: 'block',
                marginBottom: '8px'
              }}
            >
              photos
            </label>
            <div style={{
              border: '2px dashed #444',
              borderRadius: '12px',
              padding: '18px 12px 12px 12px',
              background: 'rgba(196,244,76,0.07)',
              minHeight: 80,
              textAlign: 'left',
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-start' }}>
                {existingPhotos.length > 0 && existingPhotos.map((photo, idx) => (
                  <div
                    key={`existing-${idx}`}
                    style={{
                      position: 'relative',
                      width: 70,
                      height: 70,
                      borderRadius: 8,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={photo}
                      alt={`Photo ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingPhoto(idx)}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 22,
                        height: 22,
                        cursor: 'pointer',
                        fontSize: 15,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                      }}
                      aria-label="Supprimer la photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {photoFiles.length > 0 && photoFiles.map((file, idx) => (
                  <div
                    key={`new-${idx}`}
                    style={{
                      position: 'relative',
                      width: 70,
                      height: 70,
                      borderRadius: 8,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #c4f44c'
                    }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 22,
                        height: 22,
                        cursor: 'pointer',
                        fontSize: 15,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                      }}
                      aria-label="Supprimer la nouvelle photo"
                    >
                      ×
                    </button>
                    <div style={{
                      position: 'absolute',
                      bottom: 2,
                      left: 2,
                      background: '#c4f44c',
                      color: '#000',
                      fontSize: '10px',
                      padding: '1px 4px',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      NEW
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className={styles['form-btn']}
                style={{
                  marginTop: 14,
                  fontSize: 15,
                  padding: '7px 18px'
                }}
                onClick={handleAddPhoto}
              >
                + Ajouter une photo
              </button>
              <input
                type="file"
                id="add-photo-input"
                style={{ display: 'none' }}
                accept="image/png, image/jpeg"
                multiple
                onChange={handleExtraPhoto}
              />
            </div>
          </div>
          {entry && Object.entries(formData).filter(([key]) => 
            key !== '_id' && 
            key !== 'createdAt' && 
            key !== 'updatedAt' &&
            key !== 'photos' &&
            key !== 'existingPhotos'
          ).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '1.5rem' }}>
              <label 
                className={styles['form-label']}
                style={{
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                {key}
              </label>
              <input
                className={styles['form-input']}
                type={typeof value === 'number' ? 'number' : 'text'}
                value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
                onChange={(e) => handleInputChange(key, e.target.value)}
                style={{
                  marginBottom: 0
                }}
              />
            </div>
          ))}

          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <button
              className={styles['form-btn']}
              onClick={handleSave}
              disabled={isSaving}
              style={{
                opacity: isSaving ? 0.6 : 1,
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
