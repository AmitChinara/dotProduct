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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = {
                    headers: { Authorization: `Token ${token}` },
                };

                const incomeRes = await axios.get('http://127.0.0.1:8000/api/income/', config);
                const expenseRes = await axios.get('http://127.0.0.1:8000/api/expenses/', config);

                const formattedIncome = incomeRes.data.payload.map(item => ({
                    category: item.name,
                    amount: parseFloat(item.amount),
                }));

                const formattedExpense = expenseRes.data.payload.map(item => ({
                    category: item.name,
                    amount: parseFloat(item.amount),
                }));

                setIncomeData(formattedIncome);
                setExpenseData(formattedExpense);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FFF', '#FF6B6B'];

    const totalIncome = incomeData.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpense = expenseData.reduce((sum, entry) => sum + entry.amount, 0);
    const balance = totalIncome - totalExpense;

    const renderPieChart = (data, title, total) => (
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

    if (loading) {
        return <div className="dashboard-container"><p>Loading...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <div className="header-row">
                <h2>DotProduct</h2>
                <button onClick={handleLogout}>Logout</button>
            </div>

            <div className="charts-area">
                {renderPieChart(incomeData, 'Income', totalIncome)}
                {renderPieChart(expenseData, 'Expense', totalExpense)}
            </div>

            <div className="balance-box">
                <h4>Balance</h4>
                <p>₹ {balance.toLocaleString()}</p>
            </div>
        </div>
    );
};

export default Dashboard;
