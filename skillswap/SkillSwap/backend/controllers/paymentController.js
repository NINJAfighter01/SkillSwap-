const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Razorpay = require('razorpay');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require('../config/razorpay');

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

// Initiate payment
exports.initiatePayment = async (req, res) => {
    const { amount, currency } = req.body;

    try {
        const options = {
            amount: amount * 100, // amount in smallest currency unit
            currency,
            receipt: `receipt_order_${Math.random()}`,
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error initiating payment', error });
    }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
    const { paymentId, orderId, signature } = req.body;

    const generatedSignature = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(orderId + '|' + paymentId)
        .digest('hex');

    if (generatedSignature === signature) {
        // Payment is verified
        res.status(200).json({ message: 'Payment verified successfully' });
    } else {
        res.status(400).json({ message: 'Payment verification failed' });
    }
};

// Get subscription plans
exports.getSubscriptionPlans = async (req, res) => {
    try {
        const plans = await Subscription.findAll();
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subscription plans', error });
    }
};

// Get user wallet balance
exports.getWalletBalance = async (req, res) => {
    const userId = req.user.id;

    try {
        const payments = await Payment.findAll({ where: { userId } });
        const balance = payments.reduce((acc, payment) => acc + payment.amount, 0);
        res.status(200).json({ balance });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wallet balance', error });
    }
};

// Get token transaction history
exports.getTokenHistory = async (req, res) => {
    const userId = req.user.id;

    try {
        const tokenHistory = await TokenHistory.findAll({ where: { userId } });
        res.status(200).json(tokenHistory);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching token history', error });
    }
};