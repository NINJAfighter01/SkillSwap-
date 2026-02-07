import React, { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

const SubscriptionPlanCard = ({ plan, onSelect }) => {
  const { isDark } = useContext(ThemeContext)

  return (
    <div
      className={`rounded-lg shadow-lg p-8 transition transform hover:scale-105 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } ${plan.isPopular ? 'ring-2 ring-blue-600 scale-105' : ''}`}
    >
      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
      <div className="text-4xl font-bold text-blue-600 mb-4">₹{plan.price}</div>
      <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        per month
      </p>

      <ul className={`mb-8 space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan)}
        className={`w-full py-3 rounded-lg font-semibold transition ${
          plan.isPopular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : isDark
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        {plan.isPopular ? 'Most Popular' : 'Select Plan'}
      </button>
    </div>
  )
}

export default SubscriptionPlanCard
