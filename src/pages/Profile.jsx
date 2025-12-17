import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

const API_URL = import.meta.env.VITE_API_URL || 'https://hormigapp.onrender.com/api';

export function Profile() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const { resetOnboarding } = useApi();

    // Session timer
    const [sessionTime, setSessionTime] = useState(0);

    // Password change form
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Email change form
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailPassword, setEmailPassword] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [emailError, setEmailError] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);

    // Session timer effect
    useEffect(() => {
        const startTime = localStorage.getItem('sessionStartTime');
        if (!startTime) {
            localStorage.setItem('sessionStartTime', Date.now().toString());
        }

        const interval = setInterval(() => {
            const start = parseInt(localStorage.getItem('sessionStartTime') || Date.now().toString());
            setSessionTime(Math.floor((Date.now() - start) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatSessionTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        }
        return `${secs}s`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('sessionStartTime');
        logout();
        navigate('/login');
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword !== confirmPassword) {
            setPasswordError('Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (!currentPassword) {
            setPasswordError('Debes ingresar tu contraseña actual');
            return;
        }

        setPasswordLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/me/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    password: newPassword,
                    password_confirm: confirmPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Manejar errores específicos del backend
                if (errorData.current_password) {
                    setPasswordError(Array.isArray(errorData.current_password)
                        ? errorData.current_password[0]
                        : errorData.current_password);
                } else if (errorData.password_confirm) {
                    setPasswordError(Array.isArray(errorData.password_confirm)
                        ? errorData.password_confirm[0]
                        : errorData.password_confirm);
                } else if (errorData.password) {
                    setPasswordError(Array.isArray(errorData.password)
                        ? errorData.password[0]
                        : errorData.password);
                } else if (errorData.detail) {
                    setPasswordError(errorData.detail);
                } else {
                    setPasswordError('Error al cambiar la contraseña');
                }
                return;
            }

            setPasswordSuccess('Contraseña actualizada correctamente');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordForm(false);
        } catch (err) {
            setPasswordError('Error de conexión. Intenta nuevamente.');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleEmailChange = async (e) => {
        e.preventDefault();
        setEmailMessage('');
        setEmailError('');

        if (!newEmail.includes('@')) {
            setEmailError('Ingresa un email válido');
            return;
        }

        if (!emailPassword) {
            setEmailError('Debes ingresar tu contraseña');
            return;
        }

        setEmailLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/email-change/request/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    new_email: newEmail,
                    password: emailPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.new_email) {
                    setEmailError(Array.isArray(data.new_email) ? data.new_email[0] : data.new_email);
                } else if (data.password) {
                    setEmailError(Array.isArray(data.password) ? data.password[0] : data.password);
                } else if (data.error) {
                    setEmailError(data.error);
                } else {
                    setEmailError('Error al solicitar cambio de email');
                }
                return;
            }

            setEmailMessage(data.message);
            setNewEmail('');
            setEmailPassword('');
            setShowEmailForm(false);
        } catch (err) {
            setEmailError('Error de conexión. Intenta nuevamente.');
        } finally {
            setEmailLoading(false);
        }
    };

    // Show loading if no user data
    if (!user) {
        return (
            <div className="empty-state">
                <div className="spinner"></div>
                <p>Cargando perfil...</p>
            </div>
        );
    }

    return (
        <>
            <h1 style={{ marginBottom: '24px' }}>Mi Perfil</h1>

            {/* User Info Card */}
            <div className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        boxShadow: 'var(--shadow-md)'
                    }}>
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 style={{ marginBottom: '4px', fontSize: '1.25rem' }}>{user?.username}</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Session Info */}
            <div className="card" style={{ marginBottom: '16px', background: 'var(--bg-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            Tiempo de sesión actual
                        </p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-blue)' }}>
                            🕐 {formatSessionTime(sessionTime)}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            Token expira en
                        </p>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            60 minutos (desde login)
                        </p>
                    </div>
                </div>
            </div>

            {/* Change Password Section */}
            <div className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPasswordForm ? '16px' : '0' }}>
                    <div>
                        <h3 style={{ marginBottom: '4px' }}>Contraseña</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Cambia tu contraseña de acceso
                        </p>
                    </div>
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            setShowPasswordForm(!showPasswordForm);
                            setPasswordError('');
                            setPasswordSuccess('');
                        }}
                    >
                        {showPasswordForm ? 'Cancelar' : 'Cambiar'}
                    </button>
                </div>

                {showPasswordForm && (
                    <form onSubmit={handlePasswordChange} style={{
                        padding: '16px',
                        background: 'var(--bg-light)',
                        borderRadius: '8px',
                        marginTop: '8px'
                    }}>
                        <div className="form-group">
                            <label className="form-label">Contraseña actual</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nueva contraseña</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Mínimo 8 caracteres"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirmar nueva contraseña</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {passwordError && (
                            <p style={{ color: 'var(--balance-negative)', marginBottom: '12px', fontSize: '0.875rem' }}>
                                {passwordError}
                            </p>
                        )}

                        {passwordSuccess && (
                            <p style={{ color: 'var(--balance-positive)', marginBottom: '12px', fontSize: '0.875rem' }}>
                                {passwordSuccess}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={passwordLoading}
                        >
                            {passwordLoading ? 'Guardando...' : 'Guardar contraseña'}
                        </button>
                    </form>
                )}
            </div>

            {/* Change Email Section */}
            <div className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showEmailForm ? '16px' : '0' }}>
                    <div>
                        <h3 style={{ marginBottom: '4px' }}>Correo electrónico</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {user?.email}
                        </p>
                    </div>
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            setShowEmailForm(!showEmailForm);
                            setEmailMessage('');
                            setEmailError('');
                            setEmailPassword('');
                        }}
                    >
                        {showEmailForm ? 'Cancelar' : 'Cambiar'}
                    </button>
                </div>

                {emailMessage && !showEmailForm && (
                    <p style={{
                        color: 'var(--balance-positive)',
                        fontSize: '0.875rem',
                        marginTop: '12px',
                        padding: '12px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '8px'
                    }}>
                        ✅ {emailMessage}
                    </p>
                )}

                {showEmailForm && (
                    <form onSubmit={handleEmailChange} style={{
                        padding: '16px',
                        background: 'var(--bg-light)',
                        borderRadius: '8px',
                        marginTop: '8px'
                    }}>
                        <div className="form-group">
                            <label className="form-label">Nuevo correo electrónico</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="nuevo@email.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Contraseña actual</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={emailPassword}
                                onChange={(e) => setEmailPassword(e.target.value)}
                                required
                            />
                        </div>

                        <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '12px',
                            padding: '8px',
                            background: 'var(--bg-white)',
                            borderRadius: '6px',
                            border: '1px solid var(--border-light)'
                        }}>
                            📧 Se enviará un enlace de confirmación a tu correo ACTUAL para verificar el cambio.
                        </p>

                        {emailError && (
                            <p style={{
                                color: 'var(--balance-negative)',
                                marginBottom: '12px',
                                fontSize: '0.875rem'
                            }}>
                                {emailError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={emailLoading}
                        >
                            {emailLoading ? 'Enviando...' : 'Enviar enlace de confirmación'}
                        </button>
                    </form>
                )}
            </div>

            {/* Account Info */}
            <div className="card" style={{ marginBottom: '16px' }}>
                <h3 style={{ marginBottom: '16px' }}>Información de la cuenta</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Nombre de usuario</span>
                        <span style={{ fontWeight: 500 }}>{user?.username}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Email</span>
                        <span style={{ fontWeight: 500 }}>{user?.email}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Miembro desde</span>
                        <span style={{ fontWeight: 500 }}>{formatDate(user?.date_joined)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Último acceso</span>
                        <span style={{ fontWeight: 500 }}>{formatDate(user?.last_login)}</span>
                    </div>
                </div>
            </div>

            {/* View Tour Button */}
            <button
                onClick={async () => {
                    await resetOnboarding();
                    window.location.reload();
                }}
                className="btn btn-secondary"
                style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Ver tour de bienvenida
            </button>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="btn"
                style={{
                    width: '100%',
                    padding: '12px',
                    background: 'transparent',
                    color: 'var(--balance-negative)',
                    border: '2px solid var(--balance-negative)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cerrar sesión
            </button>
        </>
    );
}
