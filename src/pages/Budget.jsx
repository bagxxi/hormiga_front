import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

export function Budget() {
    const [budget, setBudget] = useState(null);
    const [fixedExpenses, setFixedExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddFixed, setShowAddFixed] = useState(false);
    const [newFixedName, setNewFixedName] = useState('');
    const [newFixedAmount, setNewFixedAmount] = useState('');

    // Form values
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [savingsGoal, setSavingsGoal] = useState('');
    const [cycleStartDay, setCycleStartDay] = useState('');

    const { getBudget, updateBudget, getFixedExpenses, addFixedExpense, deleteFixedExpense } = useApi();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [budgetData, fixedData] = await Promise.all([
                getBudget(),
                getFixedExpenses()
            ]);
            setBudget(budgetData);
            setFixedExpenses(fixedData);
            // Initialize form values
            setMonthlyIncome(Math.round(budgetData.monthly_income || 0).toString());
            setSavingsGoal(Math.round(budgetData.savings_goal || 0).toString());
            setCycleStartDay((budgetData.cycle_start_day || 1).toString());
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBudget = async () => {
        setSaving(true);
        try {
            const updated = await updateBudget({
                monthly_income: parseInt(monthlyIncome) || 0,
                savings_goal: parseInt(savingsGoal) || 0,
                cycle_start_day: Math.min(28, Math.max(1, parseInt(cycleStartDay) || 1))
            });
            setBudget(updated);
        } catch (error) {
            console.error('Error updating budget:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleAddFixedExpense = async (e) => {
        e.preventDefault();
        try {
            await addFixedExpense({
                name: newFixedName,
                amount: parseInt(newFixedAmount) || 0
            });
            setNewFixedName('');
            setNewFixedAmount('');
            setShowAddFixed(false);
            loadData();
        } catch (error) {
            console.error('Error adding fixed expense:', error);
        }
    };

    const handleDeleteFixed = async (id) => {
        if (confirm('¿Eliminar este gasto fijo?')) {
            await deleteFixedExpense(id);
            loadData();
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

    if (loading) {
        return (
            <div className="empty-state">
                <div className="spinner"></div>
                <p>Cargando presupuesto...</p>
            </div>
        );
    }

    return (
        <>
            <h1 style={{ marginBottom: '24px' }}>Presupuesto</h1>

            {/* Ingreso mensual */}
            <div className="card" style={{ marginBottom: '16px' }}>
                <h3 style={{ marginBottom: '16px' }}>Ingreso mensual</h3>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Ingreso líquido mensual (CLP)</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        className="form-input"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ej: 800000"
                    />
                </div>
            </div>

            {/* Meta de ahorro */}
            <div className="card" style={{ marginBottom: '16px' }}>
                <h3 style={{ marginBottom: '16px' }}>Meta de ahorro</h3>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Cuánto quieres ahorrar cada mes (CLP)</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        className="form-input"
                        value={savingsGoal}
                        onChange={(e) => setSavingsGoal(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ej: 100000"
                    />
                </div>
            </div>

            {/* Día de ciclo */}
            <div className="card" style={{ marginBottom: '16px' }}>
                <h3 style={{ marginBottom: '16px' }}>Día de inicio del ciclo</h3>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">¿Qué día del mes recibes tu sueldo? (1-28)</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        className="form-input"
                        value={cycleStartDay}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 28)) {
                                setCycleStartDay(val);
                            }
                        }}
                        placeholder="Ej: 1"
                    />
                </div>
            </div>

            {/* Botón guardar */}
            <button
                onClick={handleSaveBudget}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', marginBottom: '16px' }}
                disabled={saving}
            >
                {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>

            {/* Gastos fijos */}
            <div className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3>Gastos fijos</h3>
                    <button className="btn btn-secondary" onClick={() => setShowAddFixed(!showAddFixed)}>
                        {showAddFixed ? 'Cancelar' : '+ Añadir'}
                    </button>
                </div>

                {showAddFixed && (
                    <form onSubmit={handleAddFixedExpense} style={{ marginBottom: '16px', padding: '16px', background: 'var(--bg-light)', borderRadius: '8px' }}>
                        <div className="form-group">
                            <label className="form-label">Nombre</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Ej: Arriendo, Netflix, etc."
                                value={newFixedName}
                                onChange={(e) => setNewFixedName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Monto mensual (CLP)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                className="form-input"
                                placeholder="Ej: 50000"
                                value={newFixedAmount}
                                onChange={(e) => setNewFixedAmount(e.target.value.replace(/\D/g, ''))}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Guardar</button>
                    </form>
                )}

                {fixedExpenses.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '16px' }}>
                        No hay gastos fijos registrados
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {fixedExpenses.map((expense) => (
                            <div key={expense.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                background: 'var(--bg-light)',
                                borderRadius: '8px'
                            }}>
                                <span>{expense.name}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(expense.amount)}</span>
                                    <button
                                        onClick={() => handleDeleteFixed(expense.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px',
                            borderTop: '2px solid var(--border-light)',
                            marginTop: '8px',
                            fontWeight: 600
                        }}>
                            <span>Total gastos fijos</span>
                            <span>{formatCurrency(budget?.total_fixed_expenses || 0)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Resumen */}
            <div className="card" style={{ background: 'var(--primary-blue)', color: 'white' }}>
                <h3 style={{ marginBottom: '16px' }}>Resumen mensual</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ opacity: 0.8 }}>Ingreso</span>
                        <span>{formatCurrency(budget?.monthly_income || 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ opacity: 0.8 }}>- Meta de ahorro</span>
                        <span>{formatCurrency(budget?.savings_goal || 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ opacity: 0.8 }}>- Gastos fijos</span>
                        <span>{formatCurrency(budget?.total_fixed_expenses || 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ opacity: 0.8 }}>- Gastos hormiga (este mes)</span>
                        <span>{formatCurrency(budget?.total_ant_expenses || 0)}</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(255,255,255,0.3)',
                        marginTop: '8px',
                        fontSize: '1.25rem',
                        fontWeight: 700
                    }}>
                        <span>Disponible</span>
                        <span>{formatCurrency(budget?.available_money || 0)}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
