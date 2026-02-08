import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenContext } from '../../context/TokenContext';
import { paymentService } from '../../services/paymentService';

const PaymentForm = () => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const { updateTokenBalance } = useContext(TokenContext);
    const navigate = useNavigate();

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await paymentService.initiatePayment({ amount });
            if (response.success) {
                updateTokenBalance(response.newBalance);
                navigate('/subscription'); // Redirect to subscription page after payment
            } else {
                alert('Payment failed. Please try again.');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('An error occurred while processing your payment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-form">
            <h2>Make a Payment</h2>
            <form onSubmit={handlePayment}>
                <div>
                    <label htmlFor="amount">Amount (in tokens):</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Pay Now'}
                </button>
            </form>
        </div>
    );
};

export default PaymentForm;