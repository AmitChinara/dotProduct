import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import API_ENDPOINTS from '../config/apiConfig';
import { AuthContext } from '../auth/AuthContext';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // clear error before new attempt

        try {
            const response = await axios.post(API_ENDPOINTS.LOGIN, {
                username,
                password
            });

            const token = response.data.token;
            if (token) {
                login(token);
                navigate('/dashboard');
            } else {
                setError('No token received from server');
            }
        } catch (err) {
            console.error(err);
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
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
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
}

export default Login;
