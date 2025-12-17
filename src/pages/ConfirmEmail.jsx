import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://hormigapp.onrender.com/api';

export function ConfirmEmail() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        confirmEmail();
    }, [token]);

    const confirmEmail = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/email-change/confirm/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setMessage(data.message);
                // Redirigir al login después de 3 segundos
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.error || 'Error al confirmar el cambio');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div className="spinner"></div>
                <p>Confirmando cambio de email...</p>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'var(--bg-light)'
        }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                {success ? (
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
                        <h2 style={{ marginBottom: '12px', color: 'var(--balance-positive)' }}>
                            ¡Email actualizado!
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            {message}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Redirigiendo al login...
                        </p>
                    </div>
                ) : (
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
                        <h2 style={{ marginBottom: '12px' }}>Error</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            {error}
                        </p>
                        <Link
                            to="/perfil"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '12px' }}
                        >
                            Volver al perfil
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
