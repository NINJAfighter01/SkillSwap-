const Razorpay = require('razorpay')
const crypto = require('crypto')
const Payment = require('../models/Payment')
const Subscription = require('../models/Subscription')
const User = require('../models/User')

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const PLANS = [
  {
    id: 1,
    name: 'Basic',
    price: 300,
    tokens: 500,
    features: [
      'Learning Tokens',
      'Chat Tokens',
      'Anytime Support',
    ],
  },
  {
    id: 2,
    name: 'Pro',
    price: 500,
    tokens: 1000,
    features: [
      'Learning Tokens',
      'Chat Tokens',
      'Anytime Support',
      'Premium Lectures',
      'Free Notes',
    ],
  },
  {
    id: 3,
    name: 'Premium',
    price: 800,
    tokens: 2000,
    features: [
      'Learning Tokens',
      'Chat Tokens',
      'Anytime Support',
      'Premium Lectures',
      'Premium Notes',
      'Free Notes',
      'Priority Support',
    ],
    isPopular: true,
  },
]

exports.getSubscriptionPlans = (req, res) => {
  res.json({ plans: PLANS })
}

exports.initiatePayment = async (req, res, next) => {
  try {
    const { planId } = req.body

    const plan = PLANS.find((p) => p.id === planId)
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' })
    }

    const options = {
      amount: plan.price * 100,
      currency: 'INR',
      receipt: `order_${req.userId}_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)

    // Store order in database
    const payment = await Payment.create({
      userId: req.userId,
      orderId: order.id,
      amount: plan.price,
      status: 'pending',
      planId: plan.id,
    })

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    next(error)
  }
}

exports.verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature } = req.body

    // Verify signature
    const text = orderId + '|' + paymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex')

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid signature' })
    }

    // Update payment status
    const payment = await Payment.findOne({ where: { orderId } })
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    payment.status = 'success'
    payment.paymentId = paymentId
    await payment.save()

    // Create subscription
    const plan = PLANS.find((p) => p.id === payment.planId)
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    await Subscription.create({
      userId: req.userId,
      planId: payment.planId,
      status: 'active',
      endDate,
    })

    // Add tokens to user
    const user = await User.findByPk(req.userId)
    user.tokens += plan.tokens
    await user.save()

    res.json({
      message: 'Payment verified successfully',
      subscription: {
        planId: payment.planId,
        tokens: plan.tokens,
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.getUserSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.userId, status: 'active' },
    })

    if (!subscription) {
      return res.json({ subscription: null })
    }

    const plan = PLANS.find((p) => p.id === subscription.planId)

    res.json({
      subscription: {
        ...subscription.toJSON(),
        plan,
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.getTokenHistory = async (req, res, next) => {
  try {
    const TokenHistory = require('../models/TokenHistory')
    const history = await TokenHistory.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
      limit: 50,
    })

    res.json({ history })
  } catch (error) {
    next(error)
  }
}

exports.getWallet = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId)

    const TokenHistory = require('../models/TokenHistory')
    const history = await TokenHistory.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
    })

    res.json({
      balance: user.tokens,
      history,
    })
  } catch (error) {
    next(error)
  }
}
