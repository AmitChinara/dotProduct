import { useState } from 'react';
import ROUTES from '../constants/routes';
import './Login.css';
import axiosInstance from "../api/axiosInstance";  // Add this import

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post(ROUTES.LOGIN_URL, {
                username,
                password,
            });
            const token = response.data.token;
            onLogin(token); // This should update App's token state immediately
        } catch (error) {
            setError('Invalid credentials');
        }
    };


    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2>Login</h2>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit">Login</button>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
};

export default Login;
