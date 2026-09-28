'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { defaultFormConfig } from '../../config/default.formConfig';
import styles from '../DynamicForm/DynamicForm.module.css';

const AdminAuth = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setIsAuthorized(!!data.authenticated);
        setIsLoading(false);
        // Si on est sur /admin et connecté, on redirige vers /admin/create
      })
      .catch(() => {
        setIsAuthorized(false);
        setIsLoading(false);
      });
  }, [pathname]);

  const handleAccessCode = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthorized(true);
        setAccessCode('');
        // Redirige vers /admin/create après connexion
        router.replace('/admin/create');
      } else {
        setError(data.message || 'Code d\'accès incorrect');
      }
    } catch (err) {
      setError('Erreur serveur');
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setAccessCode('');
    document.cookie = 'admin_jwt=; path=/; max-age=0;';
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-bg, #181818)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ color: 'var(--color-label, #fff)' }}>
          Chargement...
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-bg, #181818)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'var(--color-bg-alt, #202020)',
          border: '2px solid var(--color-input-border, #333)',
          borderRadius: '20px',
          padding: '1.5rem',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            color: 'var(--color-form-label, #c4f44c)',
            marginBottom: '1rem',
            fontSize: '1.5rem',
            fontWeight: '600',
            textAlign: 'left'
          }}>
            Panel
          </h2>
          <form onSubmit={handleAccessCode}>
            <input
              className={styles['form-input']}
              type="password"
              placeholder="Code d'accès"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              style={{
                marginBottom: error ? '0.5rem' : '1.5rem',
                textAlign: 'center'
              }}
              autoFocus
            />
            {error && (
              <div style={{
                color: '#ef4444',
                fontSize: '0.9rem',
                marginBottom: '1.5rem'
              }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="submit"
                className={styles['form-btn']}
                style={{
                  width: '60%',
                  minWidth: 110,
                  transform: 'skewX(-6deg)'
                }}
              >
                Accéder
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleLogout}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(239,68,68,0.2)',
          border: '1px solid rgba(239,68,68,0.5)',
          borderRadius: '8px',
          color: '#fca5a5',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          fontSize: '0.9rem',
          zIndex: 1000
        }}
      >
        Déconnexion →
      </button>
      {children}
    </div>
  );
};

export default AdminAuth;