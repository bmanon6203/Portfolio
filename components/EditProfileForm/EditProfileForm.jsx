import React, { useState, useEffect } from 'react';
import styles from '../DynamicForm/DynamicForm.module.css';

const defaultFields = [
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'linkedin', label: 'Lien LinkedIn', type: 'text', required: false },
  { name: 'whatsapp', label: 'Lien WhatsApp', type: 'text', required: false },
  { name: 'gmail', label: 'Lien Gmail', type: 'text', required: false },
  { name: 'facebook', label: 'Lien Facebook', type: 'text', required: false },
];

export default function EditProfileForm({ onSave, initialData = {} }) {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFormData({
      description: initialData.description || '',
      linkedin: initialData.linkedin || '',
      whatsapp: initialData.whatsapp || '',
      gmail: initialData.gmail || '',
      facebook: initialData.facebook || '',
    });
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde');
      setSuccess(true);
      if (onSave) onSave();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles['form-card']} onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto' }}>
      {defaultFields.map(field => (
        <div key={field.name} style={{ marginBottom: 18 }}>
          <label className={styles['form-label']} htmlFor={field.name}>{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required={field.required}
              className={styles['form-input']}
              rows={4}
            />
          ) : (
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required={field.required}
              className={styles['form-input']}
            />
          )}
        </div>
      ))}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ color: '#c4f44c', marginBottom: 12 }}>Profil sauvegardé !</div>}
      <button type="submit" className={styles['form-btn']} disabled={isLoading}>
        {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </form>
  );
}
