const admin = require('firebase-admin')

let adminApp = null

const getFirebaseAdmin = () => {
  if (adminApp) return admin

  const rawConfig = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!rawConfig) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not set')
  }

  let serviceAccount
  try {
    serviceAccount = JSON.parse(rawConfig)
  } catch (error) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON')
  }

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  }

  adminApp = admin
  return admin
}

module.exports = { getFirebaseAdmin }
