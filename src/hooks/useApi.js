import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://hormigapp.onrender.com/api';

export function useApi() {
    const { token, logout } = useAuth();

    const fetchWithAuth = async (endpoint, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            logout();
            throw new Error('Sesión expirada');
        }

        return response;
    };

    // Budget
    const getBudget = async () => {
        const response = await fetchWithAuth('/finance/budget/');
        return response.json();
    };

    const updateBudget = async (data) => {
        const response = await fetchWithAuth('/finance/budget/', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.json();
    };

    // Expenses
    const getExpenses = async () => {
        const response = await fetchWithAuth('/finance/expenses/');
        return response.json();
    };

    const addExpense = async (data) => {
        const response = await fetchWithAuth('/finance/expenses/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(JSON.stringify(error));
        }
        return response.json();
    };

    const deleteExpense = async (id) => {
        const response = await fetchWithAuth(`/finance/expenses/${id}/`, {
            method: 'DELETE',
        });
        return response.ok;
    };

    // Fixed Expenses
    const getFixedExpenses = async () => {
        const response = await fetchWithAuth('/finance/fixed-expenses/');
        return response.json();
    };

    const addFixedExpense = async (data) => {
        const response = await fetchWithAuth('/finance/fixed-expenses/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.json();
    };

    const deleteFixedExpense = async (id) => {
        const response = await fetchWithAuth(`/finance/fixed-expenses/${id}/`, {
            method: 'DELETE',
        });
        return response.ok;
    };

    // History
    const getHistory = async (params = '') => {
        const response = await fetchWithAuth(`/finance/history/${params}`);
        return response.json();
    };

    const downloadHistoryPDF = async (id) => {
        const response = await fetchWithAuth(`/finance/history/${id}/pdf/`);
        return response.blob();
    };

    return {
        getBudget,
        updateBudget,
        getExpenses,
        addExpense,
        deleteExpense,
        getFixedExpenses,
        addFixedExpense,
        deleteFixedExpense,
        getHistory,
        downloadHistoryPDF,
    };
}
