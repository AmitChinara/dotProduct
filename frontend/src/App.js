import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));

    const handleLogin = (token) => {
        localStorage.setItem('authToken', token);
        setAuthToken(token);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
    };

    return authToken ? (
        <Dashboard onLogout={handleLogout} token={authToken} />
    ) : (
        <Login onLogin={handleLogin} />
    );
}

export default App;
