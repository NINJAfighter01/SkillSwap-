import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTokenBalance, updateTokenBalance } from '../services/api';

const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
    const [tokenBalance, setTokenBalance] = useState(0);

    useEffect(() => {
        const fetchTokenBalance = async () => {
            const balance = await getTokenBalance();
            setTokenBalance(balance);
        };

        fetchTokenBalance();
    }, []);

    const addTokens = async (amount) => {
        const newBalance = await updateTokenBalance(amount);
        setTokenBalance(newBalance);
    };

    const deductTokens = async (amount) => {
        const newBalance = await updateTokenBalance(-amount);
        setTokenBalance(newBalance);
    };

    return (
        <TokenContext.Provider value={{ tokenBalance, addTokens, deductTokens }}>
            {children}
        </TokenContext.Provider>
    );
};

export const useToken = () => {
    return useContext(TokenContext);
};