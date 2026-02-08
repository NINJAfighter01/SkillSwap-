import React, { useContext } from 'react';
import { TokenContext } from '../../context/TokenContext';

const WalletCard = () => {
    const { walletBalance, tokenHistory } = useContext(TokenContext);

    return (
        <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Wallet Balance</h2>
            <p className="text-2xl font-bold">{walletBalance} Tokens</p>
            <h3 className="text-lg font-semibold mt-4">Transaction History</h3>
            <ul className="mt-2">
                {tokenHistory.map((transaction, index) => (
                    <li key={index} className="flex justify-between py-1">
                        <span>{transaction.description}</span>
                        <span>{transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount} Tokens</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WalletCard;