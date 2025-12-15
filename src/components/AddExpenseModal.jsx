import { useState } from 'react';

const CATEGORIES = [
    { value: 'cafe', label: 'Café', icon: '☕' },
    { value: 'snacks', label: 'Snacks', icon: '🍪' },
    { value: 'transporte', label: 'Transporte', icon: '🚌' },
    { value: 'delivery', label: 'Delivery', icon: '🛵' },
    { value: 'entretenimiento', label: 'Entretenimiento', icon: '🎮' },
    { value: 'compras', label: 'Compras', icon: '🛍️' },
    { value: 'otros', label: 'Otros', icon: '📦' },
];

export function AddExpenseModal({ onClose, onSubmit }) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('cafe');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await onSubmit({
                amount: parseFloat(amount),
                category,
                description: description || null
            });
        } catch (err) {
            setError('Error al guardar el gasto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Añadir gasto</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Monto (CLP)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="Ej: 2500"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="1"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Categoría</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setCategory(cat.value)}
                                    style={{
                                        padding: '12px 8px',
                                        border: category === cat.value ? '2px solid var(--primary-blue)' : '1px solid var(--border-light)',
                                        borderRadius: '8px',
                                        background: category === cat.value ? 'var(--bg-light)' : 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descripción (opcional)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: Café en Starbucks"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p style={{ color: 'var(--balance-negative)', marginBottom: '16px', fontSize: '0.875rem' }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '12px' }}
                        disabled={loading || !amount}
                    >
                        {loading ? 'Guardando...' : 'Guardar gasto'}
                    </button>
                </form>
            </div>
        </div>
    );
}
