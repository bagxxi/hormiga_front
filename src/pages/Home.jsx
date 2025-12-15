import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { AddExpenseModal } from '../components/AddExpenseModal';

const CATEGORY_ICONS = {
    cafe: '☕',
    snacks: '🍪',
    transporte: '🚌',
    delivery: '🛵',
    entretenimiento: '🎮',
    compras: '🛍️',
    otros: '📦'
};

export function Home() {
    const [budget, setBudget] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const { getBudget, getExpenses, addExpense } = useApi();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [budgetData, expensesData] = await Promise.all([
                getBudget(),
                getExpenses()
            ]);
            setBudget(budgetData);
            setExpenses(expensesData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getBalanceStatus = (available) => {
        if (available <= 0) return 'negative';
        if (available < 10000) return 'warning';
        return 'positive';
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
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hoy';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Ayer';
        }
        return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
    };

    const handleAddExpense = async (data) => {
        try {
            await addExpense(data);
            setShowModal(false);
            loadData();
        } catch (error) {
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="empty-state">
                <div className="spinner"></div>
                <p>Cargando...</p>
            </div>
        );
    }

    const availableMoney = budget?.available_money || 0;

    return (
        <>
            {/* Balance Card */}
            <div className="card balance-card">
                <p className="balance-label">Saldo disponible para gastos</p>
                <p className={`balance-amount ${getBalanceStatus(availableMoney)}`}>
                    {formatCurrency(availableMoney)}
                </p>
                <p className="balance-subtitle">
                    De {formatCurrency(budget?.monthly_income || 0)} de ingreso mensual
                </p>
            </div>

            {/* Recent Expenses */}
            <section>
                <div className="section-header">
                    <h2 className="section-title">Últimos gastos</h2>
                    <Link to="/historial" className="section-link">Ver todos</Link>
                </div>

                {expenses.length === 0 ? (
                    <div className="card empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        <p>No hay gastos registrados</p>
                        <p>¡Registra tu primer gasto hormiga!</p>
                    </div>
                ) : (
                    <div className="expense-list">
                        {expenses.slice(0, 5).map((expense) => (
                            <div key={expense.id} className="expense-item">
                                <div className="expense-info">
                                    <div className={`expense-icon ${expense.category}`}>
                                        {CATEGORY_ICONS[expense.category] || '📦'}
                                    </div>
                                    <div className="expense-details">
                                        <h4>{expense.category_display}</h4>
                                        <span>{expense.description || 'Sin descripción'} • {formatDate(expense.date)}</span>
                                    </div>
                                </div>
                                <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* FAB Button */}
            <button className="fab" onClick={() => setShowModal(true)} title="Añadir gasto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </button>

            {/* Add Expense Modal */}
            {showModal && (
                <AddExpenseModal
                    onClose={() => setShowModal(false)}
                    onSubmit={handleAddExpense}
                />
            )}
        </>
    );
}
