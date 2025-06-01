// Dashboard.js
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
    const [formModalVisible, setFormModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        transaction_type: 'income',
        category_id: '',
        name: '',
        amount: '',
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const itemsPerPage = 7;
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FFF', '#FF6B6B'];

    const fetchData = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Token ${token}` } };

            const categoriesRes = await axios.get('http://127.0.0.1:8000/api/category/', config);
            const categoriesData = categoriesRes.data.payload;
            setCategories(categoriesData);

            if (!formData.category_id && categoriesData.length > 0) {
                setFormData(prev => ({ ...prev, category_id: categoriesData[0].id }));
            }

            const categoryMap = {};
            categoriesData.forEach(cat => { categoryMap[cat.id] = cat.name; });

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
                return Object.entries(map).map(([category, amount]) => ({ category, amount }));
            };

            setIncomeData(groupByCategory(incomeRes.data.payload));
            setExpenseData(groupByCategory(expenseRes.data.payload));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [token]);

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

    const handleLogout = async () => {
        try {
            await axios.post('http://127.0.0.1:8000/api/logout/', {}, { headers: { Authorization: `Token ${token}` } });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('authToken');
            onLogout();
        }
    };

    const handleSliceClick = (categoryName, type) => {
        const filtered = allTransactions.filter(
            tx => categories.find(c => c.id === tx.category_id)?.name === categoryName && tx.transaction_type === type
        );

        const chartData = filtered.map(tx => ({ name: tx.name, amount: parseFloat(tx.amount) }));
        setModalChartData(chartData);
        setModalTitle(`${type.toUpperCase()} - ${categoryName}`);
        setModalVisible(true);
    };

    const totalIncome = incomeData.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpense = expenseData.reduce((sum, entry) => sum + entry.amount, 0);
    const balance = totalIncome - totalExpense;
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

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

    return (
        <div className="dashboard-container">
            {/* Header, Charts, Filters, Table, Modals, etc. */}
        </div>
    );
};

export default Dashboard;
