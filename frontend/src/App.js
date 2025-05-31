import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
    // Initialize token from localStorage if present
    const [token, setToken] = useState(localStorage.getItem('token'));

    // When login succeeds, update both localStorage and React state
    const handleLogin = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);  // This should trigger re-render
    };

    // When logging out, clear both
    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    return (
        <div>
            {!token ? (
                <Login onLogin={handleLogin} />
            ) : (
                <Dashboard onLogout={handleLogout} />
            )}
        </div>
    );
}

export default App;
