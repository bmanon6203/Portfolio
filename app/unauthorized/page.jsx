export default function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#181818',
      color: '#ef4444',
      fontSize: '1.5rem',
      fontWeight: 'bold'
    }}>
      <div>Accès refusé : vous n'êtes pas autorisé à accéder à cette page.</div>
    </div>
  );
}
