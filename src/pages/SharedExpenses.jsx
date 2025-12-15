import { useState } from 'react';
import { useApi } from '../hooks/useApi';

const CATEGORIES = [
    { value: 'cafe', label: 'Café', icon: '☕' },
    { value: 'snacks', label: 'Snacks', icon: '🍪' },
    { value: 'transporte', label: 'Transporte', icon: '🚌' },
    { value: 'delivery', label: 'Delivery', icon: '🛵' },
    { value: 'entretenimiento', label: 'Entretenimiento', icon: '🎮' },
    { value: 'compras', label: 'Compras', icon: '🛍️' },
    { value: 'otros', label: 'Otros', icon: '📦' },
];

export function SharedExpenses() {
    const [totalAmount, setTotalAmount] = useState('');
    const [numberOfPeople, setNumberOfPeople] = useState('2');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('otros');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const { addExpense } = useApi();

    const calculateShare = () => {
        const total = parseInt(totalAmount) || 0;
        const people = parseInt(numberOfPeople) || 1;
        return Math.ceil(total / people); // Redondear hacia arriba para no quedarse corto
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleAddAsExpense = async () => {
        const share = calculateShare();
        if (share <= 0) {
            setError('El monto debe ser mayor a 0');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await addExpense({
                amount: share,
                category: category,
                description: description || `Gasto compartido (${numberOfPeople} personas)`
            });
            setSuccess(`¡Gasto de ${formatCurrency(share)} agregado correctamente!`);
            // Reset form
            setTotalAmount('');
            setNumberOfPeople('2');
            setDescription('');
        } catch (err) {
            setError('Error al agregar el gasto');
        } finally {
            setSaving(false);
        }
    };

    const share = calculateShare();
    const total = parseInt(totalAmount) || 0;
    const people = parseInt(numberOfPeople) || 1;

    return (
        <>
            <h1 style={{ marginBottom: '8px' }}>Gastos Compartidos</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Divide un gasto grupal y agrega tu parte como gasto hormiga
            </p>

            {/* Calculator Card */}
            <div className="card" style={{ marginBottom: '16px' }}>
                <h3 style={{ marginBottom: '16px' }}>🧮 Calculadora</h3>

                <div className="form-group">
                    <label className="form-label">Monto total del gasto (CLP)</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        className="form-input"
                        placeholder="Ej: 200000"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value.replace(/\D/g, ''))}
                        style={{ fontSize: '1.25rem', fontWeight: 600 }}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Número de personas</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                            type="button"
                            onClick={() => setNumberOfPeople(Math.max(2, people - 1).toString())}
                            className="btn btn-secondary"
                            style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
                        >
                            −
                        </button>
                        <input
                            type="text"
                            inputMode="numeric"
                            className="form-input"
                            value={numberOfPeople}
                            onChange={(e) => setNumberOfPeople(e.target.value.replace(/\D/g, '') || '1')}
                            style={{
                                textAlign: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                flex: 1
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setNumberOfPeople((people + 1).toString())}
                            className="btn btn-secondary"
                            style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Result */}
                {total > 0 && (
                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%)',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center',
                        color: 'white',
                        marginTop: '16px'
                    }}>
                        <p style={{ opacity: 0.9, marginBottom: '4px', fontSize: '0.875rem' }}>
                            Tu parte ({people} personas)
                        </p>
                        <p style={{ fontSize: '2rem', fontWeight: 700 }}>
                            {formatCurrency(share)}
                        </p>
                        <p style={{ opacity: 0.8, fontSize: '0.75rem', marginTop: '8px' }}>
                            Total: {formatCurrency(total)} ÷ {people} = {formatCurrency(share)} por persona
                        </p>
                    </div>
                )}
            </div>

            {/* Add as Expense Card */}
            {total > 0 && (
                <div className="card" style={{ marginBottom: '16px' }}>
                    <h3 style={{ marginBottom: '16px' }}>➕ Agregar como gasto</h3>

                    <div className="form-group">
                        <label className="form-label">Categoría</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setCategory(cat.value)}
                                    style={{
                                        padding: '10px 6px',
                                        border: category === cat.value ? '2px solid var(--primary-blue)' : '1px solid var(--border-light)',
                                        borderRadius: '8px',
                                        background: category === cat.value ? 'var(--bg-light)' : 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '2px',
                                        fontSize: '0.65rem'
                                    }}
                                >
                                    <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
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
                            placeholder="Ej: Cena en restaurante"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p style={{ color: 'var(--balance-negative)', marginBottom: '12px', fontSize: '0.875rem' }}>
                            {error}
                        </p>
                    )}

                    {success && (
                        <p style={{ color: 'var(--balance-positive)', marginBottom: '12px', fontSize: '0.875rem' }}>
                            {success}
                        </p>
                    )}

                    <button
                        onClick={handleAddAsExpense}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                        disabled={saving || share <= 0}
                    >
                        {saving ? 'Guardando...' : `Agregar ${formatCurrency(share)} como gasto`}
                    </button>
                </div>
            )}

            {/* Tips Card */}
            <div className="card" style={{ background: 'var(--bg-light)', border: '1px solid var(--border-light)' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '0.875rem' }}>💡 Consejos</h4>
                <ul style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    paddingLeft: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                }}>
                    <li>El monto se redondea hacia arriba para no quedarte corto</li>
                    <li>Puedes usar esto para dividir cuentas de restaurante, compras grupales, etc.</li>
                    <li>El gasto se agregará con la fecha de hoy</li>
                </ul>
            </div>
        </>
    );
}
