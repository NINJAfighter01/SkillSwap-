import React from 'react';
import { useContext } from 'react';
import { TokenContext } from '../../context/TokenContext';
import { AuthContext } from '../../context/AuthContext';

const DashboardStats = () => {
    const { tokens } = useContext(TokenContext);
    const { user } = useContext(AuthContext);

    return (
        <div className="dashboard-stats">
            <h2 className="text-xl font-bold">Dashboard Statistics</h2>
            <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="stat-card bg-white shadow-md p-4 rounded">
                    <h3 className="text-lg">Total Tokens</h3>
                    <p className="text-2xl">{tokens}</p>
                </div>
                <div className="stat-card bg-white shadow-md p-4 rounded">
                    <h3 className="text-lg">User Name</h3>
                    <p className="text-2xl">{user?.name || 'N/A'}</p>
                </div>
                <div className="stat-card bg-white shadow-md p-4 rounded">
                    <h3 className="text-lg">Email</h3>
                    <p className="text-2xl">{user?.email || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;