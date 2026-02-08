import React, { useContext, useEffect, useState } from 'react';
import { TokenContext } from '../../context/TokenContext';
import { getTokenHistory } from '../../services/userService';

const TokenHistory = () => {
    const { userTokens } = useContext(TokenContext);
    const [tokenHistory, setTokenHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTokenHistory = async () => {
            try {
                const history = await getTokenHistory();
                setTokenHistory(history);
            } catch (err) {
                setError('Failed to fetch token history');
            } finally {
                setLoading(false);
            }
        };

        fetchTokenHistory();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="token-history">
            <h2>Your Token History</h2>
            <ul>
                {tokenHistory.map((entry, index) => (
                    <li key={index}>
                        <span>{entry.date}</span>: <span>{entry.type}</span> - <span>{entry.amount} tokens</span>
                    </li>
                ))}
            </ul>
            <div>
                <strong>Total Tokens: {userTokens}</strong>
            </div>
        </div>
    );
};

export default TokenHistory;