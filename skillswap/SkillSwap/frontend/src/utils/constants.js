export const API_BASE_URL = 'http://localhost:5000/api';

export const TOKEN_KEY = 'skillswap_tokens';

export const DEFAULT_PROFILE_PIC = '/assets/images/default-profile.png';

export const SUBSCRIPTION_PLANS = [
    {
        id: 1,
        name: 'Basic',
        price: 300,
        features: [
            'Learning Tokens',
            'Chat Tokens',
            'Anytime Support'
        ]
    },
    {
        id: 2,
        name: 'Pro',
        price: 500,
        features: [
            'All Basic features',
            'Premium Lectures',
            'Free Notes'
        ]
    },
    {
        id: 3,
        name: 'Premium',
        price: 800,
        features: [
            'All Pro features',
            'Premium Notes',
            'Priority Support'
        ]
    }
];