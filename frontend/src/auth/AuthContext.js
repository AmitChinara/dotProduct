import React, { createContext, useState } from 'react';
import API_ENDPOINTS from '../config/apiConfig';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));

    const login = (token) => {
        localStorage.setItem('authToken', token);
        setAuthToken(token);
    };

    const logout = async () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                await axios.post(
                    API_ENDPOINTS.LOGOUT,
                    {},
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    }
                );
            } catch (err) {
                // Ignore 401 errors or any logout errors, always clear token
            }
        }
        localStorage.removeItem('authToken');
        setAuthToken(null);
    };

    return (
        <AuthContext.Provider value={{ authToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
