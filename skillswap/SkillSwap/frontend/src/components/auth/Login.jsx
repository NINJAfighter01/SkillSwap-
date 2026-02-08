import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { login } from '../../services/authService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await login({ email, password });
            setAuth(response.data);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit} className="w-1/3">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border border-gray-300 rounded p-2 w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border border-gray-300 rounded p-2 w-full"
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white rounded p-2 w-full">Login</button>
            </form>
        </div>
    );
};

export default Login;