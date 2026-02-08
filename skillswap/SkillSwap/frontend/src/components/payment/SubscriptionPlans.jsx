import React from 'react';

const SubscriptionPlans = () => {
    const plans = [
        {
            name: 'Basic',
            price: 300,
            features: [
                'Learning Tokens',
                'Chat Tokens',
                'Anytime Support'
            ]
        },
        {
            name: 'Pro',
            price: 500,
            features: [
                'All Basic features',
                'Premium Lectures',
                'Free Notes'
            ]
        },
        {
            name: 'Premium',
            price: 800,
            features: [
                'All Pro features',
                'Premium Notes',
                'Priority Support'
            ]
        }
    ];

    return (
        <div className="subscription-plans">
            <h2 className="text-2xl font-bold mb-4">Subscription Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan, index) => (
                    <div key={index} className="border p-4 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold">{plan.name}</h3>
                        <p className="text-lg font-bold">₹{plan.price}</p>
                        <ul className="mt-2">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="list-disc list-inside">{feature}</li>
                            ))}
                        </ul>
                        <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">Subscribe</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubscriptionPlans;