import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
    AreaChart, Area, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './Dashboard.css'; // create your own CSS or inline styles as needed

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FFF', '#FF6B6B'];

const Dashboard = ({ onLogout, token }) => {
    const [incomeData, setIncomeData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
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
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth());
    const [monthlyChartData, setMonthlyChartData] = useState([]);

    // Add state for editable starting values
    const [startingMonthlyIncome, setStartingMonthlyIncome] = useState(20000);

    // Only show the expense for the selected month, allow user to select month
    const [selectedMonth, setSelectedMonth] = useState(5); // Default to June (0-based)

    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: new Date(0, i).toLocaleString('default', { month: 'long' })
    }));

    const selectedMonthExpenseData = monthlyChartData[selectedMonth]
        ? [{ month: monthlyChartData[selectedMonth].month, expense: monthlyChartData[selectedMonth].expense, budget: startingMonthlyIncome }]
        : [{ month: monthOptions[selectedMonth].label, expense: 0, budget: startingMonthlyIncome }];

    // Data for RadarChart: compare budget vs actual expense for selected month
    const radarData = [
        {
            metric: 'Budget',
            value: startingMonthlyIncome,
        },
        {
            metric: 'Expense',
            value: selectedMonthExpenseData[0].expense,
        }
    ];

    // Get available months for the selected year
    const getAvailableMonths = () => {
        // Always return Jan-Dec for consistency
        return Array.from({ length: 12 }, (_, i) => ({
            value: i,
            label: new Date(0, i).toLocaleString('default', { month: 'long' })
        }));
    };

    // Get selected month's data
    const selectedMonthData = monthlyChartData[month] || { income: 0, expense: 0, month: getAvailableMonths()[month].label };

    // Fetch all data (categories, income, expenses)
    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Token ${token}` } };

            // Categories
            const categoriesRes = await axios.get('http://127.0.0.1:8000/api/category/', config);
            const categoriesData = categoriesRes.data.payload;
            setCategories(categoriesData);
            if (!formData.category_id && categoriesData.length > 0) {
                setFormData(fd => ({ ...fd, category_id: categoriesData[0].id }));
            }

            // Map category id => name
            const catMap = {};
            categoriesData.forEach(c => (catMap[c.id] = c.name));

            // Income & Expense transactions
            const [incomeRes, expenseRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/income/', config),
                axios.get('http://127.0.0.1:8000/api/expenses/', config),
            ]);

            const allTx = [...incomeRes.data.payload, ...expenseRes.data.payload];
            setAllTransactions(allTx);
            setFilteredTransactions(allTx);
            setCurrentPage(1);
            setSelectedTransactions([]);

            // Aggregate income by category
            const aggregateByCategory = (data) => {
                const map = {};
                data.forEach(tx => {
                    const name = catMap[tx.category_id] || 'Unknown';
                    map[name] = (map[name] || 0) + parseFloat(tx.amount);
                });
                return Object.entries(map).map(([category, amount]) => ({ category, amount }));
            };

            setIncomeData(aggregateByCategory(incomeRes.data.payload));
            setExpenseData(aggregateByCategory(expenseRes.data.payload));
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    // Filter transactions on filter change or data change
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

    // Calculate totals
    const totalIncome = incomeData.reduce((sum, x) => sum + x.amount, 0);
    const totalExpense = expenseData.reduce((sum, x) => sum + x.amount, 0);
    const balance = totalIncome - totalExpense;

    // Helper to get all years present in transactions
    const getAvailableYears = () => {
        const years = new Set();
        allTransactions.forEach(tx => {
            if (tx.created_at) {
                years.add(new Date(tx.created_at).getFullYear());
            }
        });
        return Array.from(years).sort((a, b) => b - a);
    };

    // Calculate monthly income/expense for selected year
    useEffect(() => {
        // Prepare 12 months
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

    // Pie slice click to show modal with details
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

    // Pagination slicing
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

    // Checkbox toggle
    const handleCheckboxChange = (id) => {
        setSelectedTransactions(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Logout
    const handleLogout = async () => {
        try {
            await axios.post('http://127.0.0.1:8000/api/logout/', {}, {
                headers: { Authorization: `Token ${token}` },
            });
        } catch (err) {
            console.error('Logout failed', err);
        } finally {
            localStorage.removeItem('authToken');
            onLogout();
        }
    };

    // Delete selected transactions
    const handleDelete = async () => {
        if (!window.confirm(`Delete ${selectedTransactions.length} selected transaction(s)?`)) return;
        try {
            const config = { headers: { Authorization: `Token ${token}` } };
            await Promise.all(selectedTransactions.map(id => {
                const tx = allTransactions.find(t => t.id === id);
                if (!tx) return Promise.resolve();
                if (tx.transaction_type === 'income') {
                    return axios.delete(`http://127.0.0.1:8000/api/income/delete/${id}/`, config);
                } else {
                    return axios.delete(`http://127.0.0.1:8000/api/expenses/delete/${id}/`, config);
                }
            }));
            await fetchData();
            setSelectedTransactions([]);
        } catch (err) {
            console.error('Delete error', err);
        }
    };

    // Open edit form for single selected transaction
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

    // Handle form input changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(fd => ({ ...fd, [name]: value }));
    };

    // Submit new or edited transaction
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        try {
            const config = { headers: { Authorization: `Token ${token}` } };
            const payload = {
                transaction_type: formData.transaction_type,
                category_id: formData.category_id,
                name: formData.name,
                amount: parseFloat(formData.amount),
            };

            if (formData.id) {
                // Edit existing transaction
                if (formData.transaction_type === 'income') {
                    await axios.put(`http://127.0.0.1:8000/api/income/update/${formData.id}/`, payload, config);
                } else {
                    await axios.put(`http://127.0.0.1:8000/api/expenses/update/${formData.id}/`, payload, config);
                }
            } else {
                // New transaction
                if (formData.transaction_type === 'income') {
                    await axios.post('http://127.0.0.1:8000/api/income/create/', payload, config);
                } else {
                    await axios.post('http://127.0.0.1:8000/api/expenses/create/', payload, config);
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

    // Reset form on new transaction
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

    return (
        <div className="dashboard-container" style={{ padding: 20, fontFamily: 'Arial, sans-serif', position: 'relative', minHeight: '100vh', paddingBottom: 270 }}>
            <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>DotProduct</h2>
                <button onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</button>
            </div>

            <div className="charts-area" style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginBottom: 32 }}>
                {/* Income Pie Chart */}
                <div className="chart-wrapper" style={{ width: 280, textAlign: 'center' }}>
                    <h3>Income</h3>
                    <p style={{ fontWeight: 'bold', fontSize: 18 }}>₹ {totalIncome.toLocaleString()}</p>
                    {incomeData.length ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={incomeData}
                                    dataKey="amount"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#0088FE"
                                    label
                                    onClick={(_, idx) => handleSliceClick(incomeData[idx].category, 'income')}
                                    cursor="pointer"
                                >
                                    {incomeData.map((entry, idx) => (
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
                <div className="chart-wrapper" style={{ width: 280, textAlign: 'center' }}>
                    <h3>Expense</h3>
                    <p style={{ fontWeight: 'bold', fontSize: 18 }}>₹ {totalExpense.toLocaleString()}</p>
                    {expenseData.length ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={expenseData}
                                    dataKey="amount"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#FF6B6B"
                                    label
                                    onClick={(_, idx) => handleSliceClick(expenseData[idx].category, 'expense')}
                                    cursor="pointer"
                                >
                                    {expenseData.map((entry, idx) => (
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
                <div className="transaction-wrapper" style={{ flex: 1, minWidth: 500 }}>
                    <h3>All Transactions</h3>

                    {/* Filters */}
                    <div
                        className="filter-row"
                        style={{ marginBottom: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}
                    >
                        <select
                            value={filters.category}
                            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                            style={{ padding: 6, minWidth: 140 }}
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
                            style={{ padding: 6, width: 100 }}
                        />

                        <input
                            type="number"
                            placeholder="Max Amount"
                            value={filters.maxAmount}
                            onChange={e => setFilters(f => ({ ...f, maxAmount: e.target.value }))}
                            style={{ padding: 6, width: 100 }}
                        />

                        <input
                            type="date"
                            value={filters.date}
                            onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
                            style={{ padding: 6 }}
                        />
                    </div>

                    {/* Table */}
                    <table
                        className="transaction-table"
                        style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}
                    >
                        <thead>
                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                            <th style={{ padding: 8 }}>Select</th>
                            <th style={{ padding: 8 }}>Type</th>
                            <th style={{ padding: 8 }}>Category</th>
                            <th style={{ padding: 8 }}>Name</th>
                            <th style={{ padding: 8 }}>Amount</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentTransactions.length > 0 ? currentTransactions.map(tx => (
                            <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: 6, textAlign: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedTransactions.includes(tx.id)}
                                        onChange={() => handleCheckboxChange(tx.id)}
                                    />
                                </td>
                                <td style={{ padding: 6, textTransform: 'capitalize' }}>{tx.transaction_type}</td>
                                <td style={{ padding: 6 }}>{categories.find(c => c.id === tx.category_id)?.name || 'Unknown'}</td>
                                <td style={{ padding: 6 }}>{tx.name}</td>
                                <td style={{ padding: 6 }}>₹ {parseFloat(tx.amount).toLocaleString()}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} style={{ padding: 12, textAlign: 'center' }}>No transactions found</td></tr>
                        )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 4 }}>
                        {currentPage > 1 && (
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                style={{ marginRight: 6, padding: '2px 4px' }}
                            >
                                Prev
                            </button>
                        )}
                        {/* Show up to 4 page numbers horizontally */}
                        {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map(pageNum => (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                style={{
                                    marginRight: 6,
                                    fontWeight: currentPage === pageNum ? 'bold' : 'normal',
                                    background: currentPage === pageNum ? '#e9ecef' : undefined,
                                    border: '1px solid #ccc',
                                    borderRadius: 3,
                                    padding: '2px 8px',
                                    cursor: 'pointer'
                                }}
                                disabled={currentPage === pageNum}
                            >
                                {pageNum}
                            </button>
                        ))}
                        {currentPage < totalPages && (
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                style={{ padding: '2px 4px' }}
                            >
                                Next
                            </button>
                        )}
                    </div>

                    {/* Action Icons */}
                    {selectedTransactions.length > 0 && (
                        <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginBottom: 10 }}>
                            {/* Edit icon only if single transaction selected */}
                            {selectedTransactions.length === 1 && (
                                <button
                                    onClick={handleEdit}
                                    title="Edit"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                    aria-label="Edit transaction"
                                >
                                    <FaEdit size={22} color="#007bff" />
                                </button>
                            )}
                            {/* Delete icon */}
                            <button
                                onClick={handleDelete}
                                title="Delete"
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                aria-label="Delete transaction(s)"
                            >
                                <FaTrash size={22} color="#dc3545" />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={openNewTransactionForm}
                        style={{ padding: '8px 16px', cursor: 'pointer' }}
                    >
                        New Transaction
                    </button>
                </div>
            </div>

            {/* Sticky Balance Box */}
            <div
                className="balance-box"
                style={{
                    position: 'fixed',
                    bottom: 30,
                    right: 40,
                    padding: 20,
                    border: '2px solid #007bff',
                    borderRadius: 8,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: 20,
                    color: balance >= 0 ? 'green' : 'red',
                    background: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    zIndex: 1200,
                    minWidth: 180,
                }}
            >
                Balance: ₹ {balance.toLocaleString()}
            </div>

            {/* Modal for Pie slice details */}
            {modalVisible && (
                <div
                    className="modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                    onClick={() => setModalVisible(false)}
                >
                    <div
                        className="modal-content"
                        style={{
                            backgroundColor: 'white',
                            padding: 20,
                            borderRadius: 10,
                            minWidth: 300,
                            maxWidth: 500,
                            maxHeight: '80vh',
                            overflowY: 'auto',
                        }}
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
                        <button onClick={() => setModalVisible(false)} style={{ marginTop: 10 }}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Modal for New/Edit Transaction form */}
            {formModalVisible && (
                <div
                    className="modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1100,
                    }}
                    onClick={() => { if (!formLoading) setFormModalVisible(false); }}
                >
                    <form
                        onSubmit={handleFormSubmit}
                        style={{
                            backgroundColor: 'white',
                            padding: 20,
                            borderRadius: 10,
                            minWidth: 320,
                            maxWidth: 420,
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3>{formData.id ? 'Edit Transaction' : 'New Transaction'}</h3>

                        {/* Always show dropdown for type, even in edit mode */}
                        <label style={{ display: 'block', marginBottom: 6 }}>
                            Type:
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
                        </label>

                        <label style={{ display: 'block', marginBottom: 6 }}>
                            Category:
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleFormChange}
                                disabled={formLoading}
                                style={{ marginLeft: 6 }}
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </label>

                        <label style={{ display: 'block', marginBottom: 6 }}>
                            Name:
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                disabled={formLoading}
                                required
                                style={{ width: '100%', padding: 6, marginTop: 4 }}
                            />
                        </label>

                        <label style={{ display: 'block', marginBottom: 6 }}>
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
                                style={{ width: '100%', padding: 6, marginTop: 4 }}
                            />
                        </label>

                        {formError && <p style={{ color: 'red' }}>{formError}</p>}

                        <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                            <button type="submit" disabled={formLoading} style={{ flex: 1, cursor: 'pointer' }}>
                                {formLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                type="button"
                                onClick={() => !formLoading && setFormModalVisible(false)}
                                disabled={formLoading}
                                style={{ flex: 1, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Monthly Income/Expense Chart at Bottom (not sticky) */}
            <div style={{
                width: '100%',
                background: 'white',
                borderTop: '1px solid #eee',
                boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
                padding: '16px 0 8px 0',
                marginTop: 40,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 24 }}>
                    <label>
                        Year:&nbsp;
                        <select value={year} onChange={e => setYear(Number(e.target.value))}>
                            {getAvailableYears().map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Month:&nbsp;
                        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                            {monthOptions.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </label>
                    <div style={{ fontSize: 15, color: '#555', display: 'flex', gap: 18 }}>
                        <span>
                            Budget per Month:&nbsp;
                            <input
                                type="number"
                                value={startingMonthlyIncome}
                                min={0}
                                step={1}
                                onChange={e => setStartingMonthlyIncome(Number(e.target.value))}
                                style={{
                                    width: 100,
                                    color: '#00C49F',
                                    fontWeight: 'bold',
                                    border: '1px solid #00C49F',
                                    borderRadius: 4,
                                    padding: '2px 6px',
                                    marginLeft: 4
                                }}
                            />
                        </span>
                    </div>
                </div>
                {/* Show selected month's budget vs expense as a BarChart */}
                <div style={{ width: 350, height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                            { name: 'Budget', value: startingMonthlyIncome },
                            { name: 'Expense', value: selectedMonthExpenseData[0].expense }
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="value"
                                name="Amount"
                                barSize={60}
                                radius={[8, 8, 0, 0]}
                                label={{ position: 'top', fill: '#333', fontWeight: 600 }}
                            >
                                <Cell key="budget" fill="#00C49F" /> {/* Budget: greenish */}
                                <Cell key="expense" fill="#FF6B6B" /> {/* Expense: reddish */}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
