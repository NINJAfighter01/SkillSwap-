import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, logoutUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setLoading(false);
        };

        fetchUser();
    }, []);

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};