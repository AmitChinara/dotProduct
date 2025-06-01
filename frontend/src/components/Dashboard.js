import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from 'recharts';
import './Dashboard.css';

const Dashboard = ({ onLogout, token }) => {
    const [incomeData, setIncomeData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalChartData, setModalChartData] = useState([]);
    const [filters, setFilters] = useState({ category: '', minAmount: '', maxAmount: '', date: '' });

    const itemsPerPage = 7;

    // New modal state for transaction form
    const [formModalVisible, setFormModalVisible] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        transaction_type: 'income',
        category_id: '',
        name: '',
        amount: '',
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // Fetch data function (used on mount and after form submit)
    const fetchData = async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Token ${token}` },
            };

            const categoriesRes = await axios.get('http://127.0.0.1:8000/api/category/', config);
            const categoriesData = categoriesRes.data.payload;
            setCategories(categoriesData);

            // Set default category_id for form if empty
            if (!formData.category_id && categoriesData.length > 0) {
                setFormData(prev => ({ ...prev, category_id: categoriesData[0].id }));
            }

            const categoryMap = {};
            categoriesData.forEach(cat => {
                categoryMap[cat.id] = cat.name;
            });

            const [incomeRes, expenseRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/income/', config),
                axios.get('http://127.0.0.1:8000/api/expenses/', config),
            ]);

            const allData = [...incomeRes.data.payload, ...expenseRes.data.payload];
            setAllTransactions(allData);
            setFilteredTransactions(allData);

            const groupByCategory = (data) => {
                const map = {};
                data.forEach(item => {
                    const categoryName = categoryMap[item.category_id] || 'Unknown';
                    const amount = parseFloat(item.amount);
                    if (map[categoryName]) {
                        map[categoryName] += amount;
                    } else {
                        map[categoryName] = amount;
                    }
                });
                return Object.entries(map).map(([category, amount]) => ({
                    category,
                    amount
                }));
            };

            setIncomeData(groupByCategory(incomeRes.data.payload));
            setExpenseData(groupByCategory(expenseRes.data.payload));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    useEffect(() => {
        const { category, minAmount, maxAmount, date } = filters;
        const filtered = allTransactions.filter(tx => {
            const catMatch = !category || categories.find(c => c.id === tx.category_id)?.name === category;
            const minAmtMatch = !minAmount || parseFloat(tx.amount) >= parseFloat(minAmount);
            const maxAmtMatch = !maxAmount || parseFloat(tx.amount) <= parseFloat(maxAmount);
            const dateMatch = !date || new Date(tx.created_at).toISOString().split('T')[0] === date;
            return catMatch && minAmtMatch && maxAmtMatch && dateMatch;
        });
        setFilteredTransactions(filtered);
        setCurrentPage(1);
    }, [filters, allTransactions, categories]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FFF', '#FF6B6B'];

    const totalIncome = incomeData.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpense = expenseData.reduce((sum, entry) => sum + entry.amount, 0);
    const balance = totalIncome - totalExpense;

    const handleSliceClick = (categoryName, type) => {
        const filtered = allTransactions.filter(
            tx => categories.find(c => c.id === tx.category_id)?.name === categoryName &&
                tx.transaction_type === type
        );

        const chartData = filtered.map(tx => ({
            name: tx.name,
            amount: parseFloat(tx.amount)
        }));

        setModalChartData(chartData);
        setModalTitle(`${type.toUpperCase()} - ${categoryName}`);
        setModalVisible(true);
    };

    const renderPieChart = (data, title, total, type) => (
        <div className="chart-wrapper">
            <h3>{title}</h3>
            <p className="total-amount">₹ {total.toLocaleString()}</p>
            {data.length > 0 ? (
                <ResponsiveContainer width={250} height={250}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            label
                            onClick={(e) => handleSliceClick(e.category, type)}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="chart-placeholder">No data available</div>
            )}
        </div>
    );

    const handleLogout = async () => {
        try {
            await axios.post(
                'http://127.0.0.1:8000/api/logout/',
                {},
                {
                    headers: { Authorization: `Token ${token}` },
                }
            );
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('authToken');
            onLogout();
        }
    };

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="dashboard-container">
            <div className="header-row">
                <h2>DotProduct</h2>
                <button onClick={handleLogout}>Logout</button>
            </div>

            <div className="charts-area" style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                    {renderPieChart(incomeData, 'Income', totalIncome, 'income')}
                    {renderPieChart(expenseData, 'Expense', totalExpense, 'expense')}
                </div>

                <div className="transaction-wrapper" style={{ marginLeft: '40px', flex: 1 }}>
                    <h3>All Transactions</h3>

                    <div className="filter-row">
                        <select value={filters.category} onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}>
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        <input type="number" placeholder="Min Amount" value={filters.minAmount} onChange={e => setFilters(prev => ({ ...prev, minAmount: e.target.value }))} />
                        <input type="number" placeholder="Max Amount" value={filters.maxAmount} onChange={e => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))} />
                        <input type="date" value={filters.date} onChange={e => setFilters(prev => ({ ...prev, date: e.target.value }))} />
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
                        {currentTransactions.map(tx => (
                            <tr key={tx.id}>
                                <td><input type="checkbox" /></td>
                                <td>{tx.transaction_type}</td>
                                <td>{categories.find(c => c.id === tx.category_id)?.name || 'Unknown'}</td>
                                <td>{tx.name}</td>
                                <td>₹ {parseFloat(tx.amount).toLocaleString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="pagination">
                        {currentPage > 1 && (
                            <button onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
                        )}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => Math.abs(page - currentPage) <= 1)
                            .map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={page === currentPage ? 'active' : ''}
                                >
                                    {page}
                                </button>
                            ))}
                        {currentPage < totalPages && (
                            <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                        )}
                    </div>

                    {/* New Transaction Button */}
                    <button
                        className="new-transaction-btn"
                        onClick={() => setFormModalVisible(true)}
                        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', width: 'fit-content' }}
                    >
                        New Transaction
                    </button>
                </div>
            </div>

            <div className="balance-box">
                <h4>Balance</h4>
                <p>₹ {balance.toLocaleString()}</p>
            </div>

            {/* Chart Modal */}
            {modalVisible && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button
                            className="modal-close-button"
                            onClick={() => setModalVisible(false)}
                        >
                            &times;
                        </button>
                        <h4 style={{ textAlign: 'center', marginTop: '10px' }}>{modalTitle}</h4>

                        {modalChartData.length > 0 && (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={modalChartData}
                                        dataKey="amount"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#82ca9d"
                                        label
                                    >
                                        {modalChartData.map((entry, index) => (
                                            <Cell key={`modal-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            )}

            {/* Form Modal */}
            {formModalVisible && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px', padding: '20px', position: 'relative' }}>
                        <button
                            className="modal-close-button"
                            onClick={() => setFormModalVisible(false)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '15px',
                                fontSize: '20px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            &times;
                        </button>

                        <h3>Add New Transaction</h3>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setFormError('');
                            setFormLoading(true);
                            try {
                                const url = formData.transaction_type === 'income'
                                    ? 'http://127.0.0.1:8000/api/income/create/'
                                    : 'http://127.0.0.1:800/api/expenses/create/';
                                console.log(url)
                                await axios.post(url, {
                                    name: formData.name,
                                    category_id: formData.category_id,
                                    amount: parseFloat(formData.amount),
                                }, {
                                    headers: { Authorization: `Token ${token}` },
                                });

                                await fetchData();

                                setFormData(prev => ({
                                    ...prev,
                                    name: '',
                                    amount: '',
                                }));
                                setFormModalVisible(false);
                            } catch (error) {
                                setFormError('Failed to submit transaction. Please check your input.');
                                console.error(`error: ${error}`);
                            } finally {
                                setFormLoading(false);
                            }
                        }}>
                            <label>
                                Transaction Type:
                                <select
                                    name="transaction_type"
                                    value={formData.transaction_type}
                                    onChange={e => setFormData(prev => ({ ...prev, transaction_type: e.target.value }))}
                                    required
                                >
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </label>

                            <label>
                                Category:
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={e => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
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
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Transaction Name"
                                    required
                                />
                            </label>

                            <label>
                                Amount:
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder="Amount"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </label>

                            {formError && <p style={{ color: 'red' }}>{formError}</p>}

                            <button type="submit" disabled={formLoading} style={{ cursor: formLoading ? 'not-allowed' : 'pointer' }}>
                                {formLoading ? 'Submitting...' : 'Add Transaction'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
