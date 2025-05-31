// src/components/Dashboard.js
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
    return (
        <div className="dashboard-container">
            <h2>Welcome to the Dashboard</h2>
            <button onClick={onLogout}>Logout</button>
        </div>
    );
};

export default Dashboard;
