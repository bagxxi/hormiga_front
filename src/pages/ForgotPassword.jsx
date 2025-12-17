import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://hormigapp.onrender.com/api';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/password-reset/request/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setSent(true);
            } else {
                setError(data.error || 'Error al procesar la solicitud');
            }
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

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
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '2rem'
                    }}>
                        🔐
                    </div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                        ¿Olvidaste tu contraseña?
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla
                    </p>
                </div>

                {!sent ? (
                    <form onSubmit={handleSubmit} className="card">
                        <div className="form-group">
                            <label className="form-label">Correo electrónico</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <p style={{
                                color: 'var(--balance-negative)',
                                marginBottom: '16px',
                                fontSize: '0.875rem'
                            }}>
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '12px', marginBottom: '16px' }}
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar enlace'}
                        </button>

                        <p style={{
                            textAlign: 'center',
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem'
                        }}>
                            <Link to="/login" style={{ color: 'var(--primary-blue)' }}>
                                ← Volver al inicio de sesión
                            </Link>
                        </p>
                    </form>
                ) : (
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '3rem',
                            marginBottom: '16px'
                        }}>
                            ✉️
                        </div>
                        <h2 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>
                            ¡Revisa tu correo!
                        </h2>
                        <p style={{
                            color: 'var(--text-secondary)',
                            marginBottom: '24px',
                            fontSize: '0.875rem'
                        }}>
                            {message}
                        </p>
                        <Link
                            to="/login"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '12px' }}
                        >
                            Volver al inicio de sesión
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
