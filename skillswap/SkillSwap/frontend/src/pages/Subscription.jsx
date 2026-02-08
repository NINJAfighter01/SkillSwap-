import React, { useEffect, useState, useContext } from 'react';
import { TokenContext } from '../context/TokenContext';
import SubscriptionPlans from '../components/payment/SubscriptionPlans';
import PaymentForm from '../components/payment/PaymentForm';
import WalletCard from '../components/payment/WalletCard';

const Subscription = () => {
    const { tokens } = useContext(TokenContext);
    const [isPaymentVisible, setPaymentVisible] = useState(false);

    useEffect(() => {
        // Any additional logic to fetch user subscription data can be added here
    }, []);

    const handleSubscribe = () => {
        setPaymentVisible(true);
    };

    return (
        <div className="subscription-page">
            <h1 className="text-2xl font-bold mb-4">Manage Your Subscription</h1>
            <WalletCard />
            <SubscriptionPlans onSubscribe={handleSubscribe} />
            {isPaymentVisible && <PaymentForm />}
        </div>
    );
};

export default Subscription;