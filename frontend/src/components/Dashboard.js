import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import ROUTES from '../constants/routes';
import {
    PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './Dashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FFF', '#FF6B6B'];

const Dashboard = ({ onLogout, token }) => {
    const [categories, setCategories] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [filters, setFilters] = useState({ category: '', minAmount: '', maxAmount: '', date: '' });
    const [selectedTransactions, setSelectedTransactions] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalChartData, setModalChartData] = useState([]);
    const [formModalVisible, setFormModalVisible] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        transaction_type: 'income',
        category_id: '',
        name: '',
        amount: '',
    });

    const itemsPerPage = 7;
    const [currentPage, setCurrentPage] = useState(1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [monthlyChartData, setMonthlyChartData] = useState([]);
    const [startingMonthlyIncome, setStartingMonthlyIncome] = useState(2000);

    // Fetch all data (categories, income, expenses)
    const fetchData = async () => {
        try {
            const categoriesRes = await axiosInstance.get(ROUTES.CATEGORY_URL);
            const categoriesData = categoriesRes.data.payload;
            setCategories(categoriesData);
            if (!formData.category_id && categoriesData.length > 0) {
                setFormData(fd => ({ ...fd, category_id: categoriesData[0].id }));
            }
            const [incomeRes, expenseRes] = await Promise.all([
                axiosInstance.get(ROUTES.INCOME_URL),
                axiosInstance.get(ROUTES.EXPENSES_URL),
            ]);
            const allTx = [...incomeRes.data.payload, ...expenseRes.data.payload];
            setAllTransactions(allTx);
            setFilteredTransactions(allTx);
            setCurrentPage(1);
            setSelectedTransactions([]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    // eslint-disable-next-line
    useEffect(() => { fetchData(); }, [token]);

    useEffect(() => {
        const { category, minAmount, maxAmount, date } = filters;
        const filtered = allTransactions.filter(tx => {
            const catName = categories.find(c => c.id === tx.category_id)?.name || '';
            if (category && catName !== category) return false;
            if (minAmount && parseFloat(tx.amount) < parseFloat(minAmount)) return false;
            if (maxAmount && parseFloat(tx.amount) > parseFloat(maxAmount)) return false;
            if (date && new Date(tx.created_at).toISOString().split('T')[0] !== date) return false;
            return true;
        });
        setFilteredTransactions(filtered);
        setCurrentPage(1);
        setSelectedTransactions([]);
    }, [filters, allTransactions, categories]);

    const filteredIncomeData = useMemo(() => {
        const catMap = {};
        categories.forEach(c => (catMap[c.id] = c.name));
        const filtered = filteredTransactions.filter(tx => tx.transaction_type === 'income');
        const map = {};
        filtered.forEach(tx => {
            const name = catMap[tx.category_id] || 'Unknown';
            map[name] = (map[name] || 0) + parseFloat(tx.amount);
        });
        return Object.entries(map).map(([category, amount]) => ({ category, amount }));
    }, [filteredTransactions, categories]);

    const filteredExpenseData = useMemo(() => {
        const catMap = {};
        categories.forEach(c => (catMap[c.id] = c.name));
        const filtered = filteredTransactions.filter(tx => tx.transaction_type === 'expense');
        const map = {};
        filtered.forEach(tx => {
            const name = catMap[tx.category_id] || 'Unknown';
            map[name] = (map[name] || 0) + parseFloat(tx.amount);
        });
        return Object.entries(map).map(([category, amount]) => ({ category, amount }));
    }, [filteredTransactions, categories]);

    const totalIncome = filteredIncomeData.reduce((sum, x) => sum + x.amount, 0);
    const totalExpense = filteredExpenseData.reduce((sum, x) => sum + x.amount, 0);

    // Calculate balance from all transactions, not filtered
    const allIncome = useMemo(() =>
        allTransactions.filter(tx => tx.transaction_type === 'income')
            .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
    , [allTransactions]);
    const allExpense = useMemo(() =>
        allTransactions.filter(tx => tx.transaction_type === 'expense')
            .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
    , [allTransactions]);
    const balance = allIncome - allExpense;

    const getAvailableYears = () => {
        const years = new Set();
        allTransactions.forEach(tx => {
            if (tx.created_at) {
                years.add(new Date(tx.created_at).getFullYear());
            }
        });
        return Array.from(years).sort((a, b) => b - a);
    };

    useEffect(() => {
        const months = Array.from({ length: 12 }, (_, i) => ({
            month: new Date(0, i).toLocaleString('default', { month: 'short' }),
            income: 0,
            expense: 0,
        }));
        allTransactions.forEach(tx => {
            if (!tx.created_at) return;
            const txDate = new Date(tx.created_at);
            const txYear = txDate.getFullYear();
            if (txYear !== Number(year)) return;
            const mIdx = txDate.getMonth();
            if (tx.transaction_type === 'income') {
                months[mIdx].income += parseFloat(tx.amount);
            } else if (tx.transaction_type === 'expense') {
                months[mIdx].expense += parseFloat(tx.amount);
            }
        });
        setMonthlyChartData(months);
    }, [allTransactions, year]);

    const handleSliceClick = (categoryName, type) => {
        const filtered = allTransactions.filter(tx =>
            (categories.find(c => c.id === tx.category_id)?.name === categoryName)
            && tx.transaction_type === type
        );
        const chartData = filtered.map(tx => ({
            name: tx.name,
            amount: parseFloat(tx.amount),
        }));
        setModalChartData(chartData);
        setModalTitle(`${type.toUpperCase()} - ${categoryName}`);
        setModalVisible(true);
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
    const emptyRows = itemsPerPage - currentTransactions.length > 0 ? itemsPerPage - currentTransactions.length : 0;

    const handleCheckboxChange = (id) => {
        setSelectedTransactions(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleLogout = async () => {
        try {
            await axiosInstance.post(ROUTES.LOGOUT_URL, {});
        } catch (err) {
            console.error('Logout failed', err);
        } finally {
            localStorage.removeItem('authToken');
            onLogout();
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete ${selectedTransactions.length} selected transaction(s)?`)) return;
        try {
            await Promise.all(selectedTransactions.map(id => {
                const tx = allTransactions.find(t => t.id === id);
                if (!tx) return Promise.resolve();
                if (tx.transaction_type === 'income') {
                    return axiosInstance.delete(ROUTES.INCOME_DELETE_URL(id));
                } else {
                    return axiosInstance.delete(ROUTES.EXPENSES_DELETE_URL(id));
                }
            }));
            await fetchData();
            setSelectedTransactions([]);
        } catch (err) {
            console.error('Delete error', err);
        }
    };

    const handleEdit = () => {
        if (selectedTransactions.length !== 1) return;
        const tx = allTransactions.find(t => t.id === selectedTransactions[0]);
        if (!tx) return;
        setFormData({
            transaction_type: tx.transaction_type,
            category_id: tx.category_id,
            name: tx.name,
            amount: tx.amount,
            id: tx.id,
        });
        setFormError('');
        setFormModalVisible(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(fd => ({ ...fd, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        try {
            const payload = {
                transaction_type: formData.transaction_type,
                category_id: formData.category_id,
                name: formData.name,
                amount: parseFloat(formData.amount),
            };
            if (formData.id) {
                if (formData.transaction_type === 'income') {
                    await axiosInstance.put(ROUTES.INCOME_UPDATE_URL(formData.id), payload);
                } else {
                    await axiosInstance.put(ROUTES.EXPENSES_UPDATE_URL(formData.id), payload);
                }
            } else {
                if (formData.transaction_type === 'income') {
                    await axiosInstance.post(ROUTES.INCOME_CREATE_URL, payload);
                } else {
                    await axiosInstance.post(ROUTES.EXPENSES_CREATE_URL, payload);
                }
            }
            await fetchData();
            setFormModalVisible(false);
            setSelectedTransactions([]);
        } catch (err) {
            setFormError('Failed to save transaction. Please check your inputs.');
        } finally {
            setFormLoading(false);
        }
    };

    const openNewTransactionForm = () => {
        setFormData({
            transaction_type: 'income',
            category_id: categories.length > 0 ? categories[0].id : '',
            name: '',
            amount: '',
            id: null,
        });
        setFormError('');
        setFormModalVisible(true);
    };

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    return (
        <div className="dashboard-container">
            {/* Navigation Bar */}
            <nav className="dashboard-navbar">
                <span className="dashboard-title">DotProduct</span>
                <button
                    onClick={handleLogout}
                    className="dashboard-logout-btn"
                >
                    Logout
                </button>
            </nav>
            <div className="charts-area">
                {/* Income Pie Chart */}
                <div className="chart-wrapper">
                    <h3>Income</h3>
                    <p className="total-amount">₹ {totalIncome.toLocaleString()}</p>
                    {filteredIncomeData.length ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={filteredIncomeData}
                                    dataKey="amount"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#0088FE"
                                    label
                                    onClick={(_, idx) => handleSliceClick(filteredIncomeData[idx].category, 'income')}
                                    cursor="pointer"
                                >
                                    {filteredIncomeData.map((entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p>No data available</p>}
                </div>

                {/* Expense Pie Chart */}
                <div className="chart-wrapper">
                    <h3>Expense</h3>
                    <p className="total-amount">₹ {totalExpense.toLocaleString()}</p>
                    {filteredExpenseData.length ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={filteredExpenseData}
                                    dataKey="amount"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#FF6B6B"
                                    label
                                    onClick={(_, idx) => handleSliceClick(filteredExpenseData[idx].category, 'expense')}
                                    cursor="pointer"
                                >
                                    {filteredExpenseData.map((entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p>No data available</p>}
                </div>

                {/* Transactions Table */}
                <div className="transaction-wrapper">
                    <h3>All Transactions</h3>
                    <div className="filter-row">
                        <select
                            value={filters.category}
                            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Min Amount"
                            value={filters.minAmount}
                            onChange={e => setFilters(f => ({ ...f, minAmount: e.target.value }))}
                        />
                        <input
                            type="number"
                            placeholder="Max Amount"
                            value={filters.maxAmount}
                            onChange={e => setFilters(f => ({ ...f, maxAmount: e.target.value }))}
                        />
                        <input
                            type="date"
                            value={filters.date}
                            onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
                        />
                    </div>
                    <table className="transaction-table">
                        <thead>
                        <tr>
                            <th>Select</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Name</th>
                            <th>Amount</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentTransactions.length > 0 ? currentTransactions.map(tx => (
                            <tr key={tx.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedTransactions.includes(tx.id)}
                                        onChange={() => handleCheckboxChange(tx.id)}
                                    />
                                </td>
                                <td style={{ textTransform: 'capitalize' }}>{tx.transaction_type}</td>
                                <td>{categories.find(c => c.id === tx.category_id)?.name || 'Unknown'}</td>
                                <td>{tx.name}</td>
                                <td>₹ {parseFloat(tx.amount).toLocaleString()}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="no-transactions">No transactions found</td>
                            </tr>
                        )}
                        {Array.from({ length: emptyRows }).map((_, idx) => (
                            <tr key={`empty-row-${idx}`}>
                                <td>&nbsp;</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        {currentPage > 1 && (
                            <button onClick={() => setCurrentPage(currentPage - 1)}>
                                Prev
                            </button>
                        )}
                        {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map(pageNum => (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={currentPage === pageNum ? 'active' : ''}
                                disabled={currentPage === pageNum}
                            >
                                {pageNum}
                            </button>
                        ))}
                        {currentPage < totalPages && (
                            <button onClick={() => setCurrentPage(currentPage + 1)}>
                                Next
                            </button>
                        )}
                    </div>
                    <div
                        className="action-icons"
                        style={{
                            visibility: selectedTransactions.length > 0 ? 'visible' : 'hidden'
                        }}
                    >
                        {selectedTransactions.length === 1 && (
                            <button
                                onClick={handleEdit}
                                title="Edit"
                                className="edit-btn"
                                aria-label="Edit transaction"
                            >
                                <FaEdit size={22} color="#007bff" />
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            title="Delete"
                            className="delete-btn"
                            aria-label="Delete transaction(s)"
                        >
                            <FaTrash size={22} color="#dc3545" />
                        </button>
                    </div>
                    <button
                        onClick={openNewTransactionForm}
                        className="new-transaction-btn"
                    >
                        New Transaction
                    </button>
                </div>
            </div>
            {/* Sticky Balance Box */}
            <div className="balance-box fixed-balance">
                Balance: ₹ {balance.toLocaleString()}
            </div>
            {/* Modal for Pie slice details */}
            {modalVisible && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div
                        className="modal-content"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3>{modalTitle}</h3>
                        {modalChartData.length ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={modalChartData}
                                        dataKey="amount"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        label
                                    >
                                        {modalChartData.map((entry, idx) => (
                                            <Cell key={`cell-modal-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p>No transactions found.</p>}
                        <button onClick={() => setModalVisible(false)} className="modal-close-button">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Modal for New/Edit Transaction form */}
            {formModalVisible && (
                <div className="modal-overlay" onClick={() => { if (!formLoading) setFormModalVisible(false); }}>
                    <form
                        onSubmit={handleFormSubmit}
                        className="modal-content"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3>{formData.id ? 'Edit Transaction' : 'New Transaction'}</h3>
                        <label>
                            Type:
                            {formData.id ? (
                                <span style={{ marginLeft: 8, fontWeight: 500, textTransform: 'capitalize' }}>
                                    {formData.transaction_type}
                                </span>
                            ) : (
                                <select
                                    name="transaction_type"
                                    value={formData.transaction_type}
                                    onChange={handleFormChange}
                                    disabled={formLoading}
                                    style={{ marginLeft: 6 }}
                                >
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            )}
                        </label>
                        <label>
                            Category:
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleFormChange}
                                disabled={formLoading}
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Name:
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                disabled={formLoading}
                                required
                            />
                        </label>
                        <label>
                            Amount (₹):
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleFormChange}
                                disabled={formLoading}
                                required
                                min="0.01"
                                step="0.01"
                            />
                        </label>
                        {formError && <p>{formError}</p>}
                        <div className="modal-form-actions">
                            <button type="submit" disabled={formLoading}>
                                {formLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                type="button"
                                onClick={() => !formLoading && setFormModalVisible(false)}
                                disabled={formLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Monthly Income/Expense Chart at Bottom (not sticky) */}
            <div className="bottom-bar-chart">
                <h2 className="bottom-bar-chart-title">
                    Monthly Expense vs Budget
                </h2>
                <div className="bottom-bar-chart-controls">
                    <label>
                        Year:&nbsp;
                        <select value={year} onChange={e => setYear(Number(e.target.value))}>
                            {getAvailableYears().map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </label>
                    <div>
                        <span>
                            Budget per Month:&nbsp;
                            <input
                                type="number"
                                value={startingMonthlyIncome}
                                min={0}
                                step={1}
                                onChange={e => setStartingMonthlyIncome(Number(e.target.value))}
                            />
                        </span>
                    </div>
                </div>
                <div className="bottom-bar-chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyChartData.map(m => ({
                            month: m.month,
                            Expense: m.expense,
                            Budget: startingMonthlyIncome
                        }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="Budget"
                                fill="#00C49F"
                                barSize={28}
                                radius={[8, 8, 0, 0]}
                                label={{ position: 'top', fill: '#333', fontWeight: 600 }}
                            />
                            <Bar
                                dataKey="Expense"
                                fill="#FF6B6B"
                                barSize={28}
                                radius={[8, 8, 0, 0]}
                                label={{ position: 'top', fill: '#333', fontWeight: 600 }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
