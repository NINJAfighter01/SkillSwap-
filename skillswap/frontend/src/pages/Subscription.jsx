import React, { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import SubscriptionPlanCard from '../components/SubscriptionPlanCard'
import paymentService from '../services/paymentService'
import { useNavigate } from 'react-router-dom'

const Subscription = () => {
  const { isDark } = useContext(ThemeContext)
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await paymentService.getSubscriptionPlans()
      setPlans(response.data.plans)
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
    setLoading(false)
  }

  const handleSelectPlan = async (plan) => {
    try {
      const response = await paymentService.initiatePayment(plan.id)
      
      // Initialize Razorpay
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: plan.price * 100,
        currency: 'INR',
        name: 'SkillSwap',
        description: plan.name,
        order_id: response.data.orderId,
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              orderId: response.data.razorpay_order_id,
              paymentId: response.data.razorpay_payment_id,
              signature: response.data.razorpay_signature,
            })
            alert('Payment successful!')
            navigate('/dashboard')
          } catch (error) {
            alert('Payment verification failed')
          }
        },
        prefill: {
          name: 'User',
          email: 'user@example.com',
        },
      }
      
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Error initiating payment:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-4">Choose Your Plan</h1>
        <p className="text-center mb-12 text-gray-600">
          Unlock unlimited learning with our flexible subscription plans
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Subscription
