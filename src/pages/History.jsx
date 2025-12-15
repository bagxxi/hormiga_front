import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

const CATEGORY_ICONS = {
    cafe: '☕',
    snacks: '🍪',
    transporte: '🚌',
    delivery: '🛵',
    entretenimiento: '🎮',
    compras: '🛍️',
    otros: '📦'
};

export function History() {
    const [expenses, setExpenses] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { getExpenses, getHistory, downloadHistoryPDF, deleteExpense } = useApi();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [expensesData, historyData] = await Promise.all([
                getExpenses(),
                getHistory()
            ]);
            setExpenses(expensesData);
            setHistory(historyData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(amount));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-CL', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleDownloadPDF = async (historyId) => {
        try {
            const blob = await downloadHistoryPDF(historyId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cartola_${historyId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    const handleDeleteExpense = async (id) => {
        if (confirm('¿Eliminar este gasto?')) {
            await deleteExpense(id);
            loadData();
        }
    };

    if (loading) {
        return (
            <div className="empty-state">
                <div className="spinner"></div>
                <p>Cargando historial...</p>
            </div>
        );
    }

    // Group expenses by date
    const groupedExpenses = expenses.reduce((groups, expense) => {
        const date = new Date(expense.date).toLocaleDateString('es-CL');
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(expense);
        return groups;
    }, {});

    return (
        <>
            <h1 style={{ marginBottom: '24px' }}>Historial</h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <button
                    className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('all')}
                >
                    Todos los gastos
                </button>
                <button
                    className={`btn ${filter === 'periods' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('periods')}
                >
                    Cierres mensuales
                </button>
            </div>

            {filter === 'all' ? (
                <>
                    {Object.keys(groupedExpenses).length === 0 ? (
                        <div className="card empty-state">
                            <p>No hay gastos registrados</p>
                        </div>
                    ) : (
                        Object.entries(groupedExpenses).map(([date, dayExpenses]) => (
                            <div key={date} style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                    {date}
                                </h3>
                                <div className="expense-list">
                                    {dayExpenses.map((expense) => (
                                        <div key={expense.id} className="expense-item">
                                            <div className="expense-info">
                                                <div className={`expense-icon ${expense.category}`}>
                                                    {CATEGORY_ICONS[expense.category] || '📦'}
                                                </div>
                                                <div className="expense-details">
                                                    <h4>{expense.category_display}</h4>
                                                    <span>{expense.description || 'Sin descripción'}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                                                <button
                                                    onClick={() => handleDeleteExpense(expense.id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'var(--text-secondary)',
                                                        cursor: 'pointer',
                                                        padding: '4px'
                                                    }}
                                                    title="Eliminar"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </>
            ) : (
                <>
                    {history.length === 0 ? (
                        <div className="card empty-state">
                            <p>No hay cierres mensuales registrados</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Los cierres se generan automáticamente según tu día de ciclo
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {history.map((period) => (
                                <div key={period.id} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                        <div>
                                            <h3 style={{ marginBottom: '4px' }}>
                                                {formatDate(period.period_start)} - {formatDate(period.period_end)}
                                            </h3>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                Creado el {formatDate(period.created_at)}
                                            </p>
                                        </div>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleDownloadPDF(period.id)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7 10 12 15 17 10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                            PDF
                                        </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ingreso</p>
                                            <p style={{ fontWeight: 600 }}>{formatCurrency(period.monthly_income)}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Gastos Fijos</p>
                                            <p style={{ fontWeight: 600 }}>{formatCurrency(period.total_fixed_expenses)}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Gastos Hormiga</p>
                                            <p style={{ fontWeight: 600 }}>{formatCurrency(period.total_ant_expenses)}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Remanente</p>
                                            <p style={{
                                                fontWeight: 600,
                                                color: period.remaining >= 0 ? 'var(--balance-positive)' : 'var(--balance-negative)'
                                            }}>
                                                {formatCurrency(period.remaining)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </>
    );
}
