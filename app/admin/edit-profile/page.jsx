'use client';
import React, { useEffect, useState } from 'react';
import EditProfileForm from '../../../components/EditProfileForm/EditProfileForm';
import styles from '../../../components/DynamicForm/DynamicForm.module.css';
import Link from 'next/link';

export default function EditProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Erreur lors du chargement du profil');
        const result = await res.json();
        setProfile(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div style={{ color: '#c4f44c', padding: 40 }}>Chargement du profil...</div>;
  if (error) return <div style={{ color: 'red', padding: 40 }}>{error}</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#181818', color: '#fff', padding: '2rem' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <EditProfileForm initialData={profile} />
      </div>
    </div>
  );
}
