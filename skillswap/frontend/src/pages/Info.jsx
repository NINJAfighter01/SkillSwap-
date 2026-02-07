import React, { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

const Info = () => {
  const { isDark } = useContext(ThemeContext)

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Website Information</h1>

        <div className={`rounded-lg shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} space-y-8`}>
          <section>
            <h2 className="text-2xl font-bold mb-4">About SkillSwap</h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              SkillSwap is a revolutionary peer-to-peer learning platform that connects learners and educators globally.
              Our mission is to democratize education by creating a sustainable token-based economy where every skill has value.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Technology Stack</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2">Frontend</h3>
                <ul className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• React.js</li>
                  <li>• Vite</li>
                  <li>• Tailwind CSS</li>
                  <li>• Axios</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-2">Backend</h3>
                <ul className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• Node.js</li>
                  <li>• Express.js</li>
                  <li>• Sequelize ORM</li>
                  <li>• SQLite</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact & Support</h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <strong>Email:</strong> support@skillswap.com<br />
              <strong>Phone:</strong> +91-XXXX-XXXX<br />
              <strong>Address:</strong> India<br />
              <strong>Hours:</strong> 24/7 Support Available
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Version</h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              SkillSwap v1.0.0 (Production Ready)
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Compliance</h2>
            <dl className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <div>
                <dt className="font-bold">Privacy Policy:</dt>
                <dd>Your data is encrypted and secure</dd>
              </div>
              <div>
                <dt className="font-bold">Terms of Service:</dt>
                <dd>Available upon request</dd>
              </div>
              <div>
                <dt className="font-bold">Payment Security:</dt>
                <dd>PCI-DSS compliant via Razorpay</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Info
