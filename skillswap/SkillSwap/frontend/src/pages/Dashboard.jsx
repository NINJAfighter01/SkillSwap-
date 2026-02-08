import React from 'react';
import DashboardStats from '../components/dashboard/DashboardStats';
import ProgressTracker from '../components/dashboard/ProgressTracker';
import TokenHistory from '../components/dashboard/TokenHistory';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="dashboard">
            <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}!</h1>
            <DashboardStats />
            <ProgressTracker />
            <TokenHistory />
        </div>
    );
};

export default Dashboard;