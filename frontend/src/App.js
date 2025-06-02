/**
 * App.js - Main entry point for the React frontend.
 * Handles authentication state and routes to Login or Dashboard.
 */

import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard'; // protected content

function App() {
    // Store authentication token in state (and localStorage)
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));

    // Called after successful login
    const handleLogin = (token) => {
        localStorage.setItem('authToken', token);
        setAuthToken(token);
    };

    // Called on logout
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
    };

    // Render Dashboard if authenticated, otherwise Login
    return (
        <>
            {authToken ? (
                <Dashboard onLogout={handleLogout} token={authToken} />
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </>
    );
}

export default App;

