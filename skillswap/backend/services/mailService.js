const nodemailer = require('nodemailer')

let transporter
let transporterCacheKey = ''

const normalizeEnvValue = (value = '') => {
  const text = String(value).trim()
  if (!text) {
    return ''
  }

  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    return text.slice(1, -1).trim()
  }

  return text
}

const getMailConfig = () => {
  const host = normalizeEnvValue(process.env.EMAIL_HOST || process.env.SMTP_HOST)
  const port = normalizeEnvValue(process.env.EMAIL_PORT || process.env.SMTP_PORT)
  const user = normalizeEnvValue(process.env.EMAIL_USER || process.env.SMTP_USER)
  const rawPass = normalizeEnvValue(process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || '')
  const pass = /gmail/i.test(String(host || ''))
    ? String(rawPass).replace(/\s+/g, '')
    : String(rawPass).trim()
  const from = normalizeEnvValue(process.env.EMAIL_FROM || process.env.SMTP_FROM || user)

  return { host, port, user, pass, from }
}

const hasSmtpConfig = () => {
  const config = getMailConfig()
  return Boolean(
    config.host &&
      config.port &&
      config.user &&
      config.pass
  )
}

const getTransporter = () => {
  if (!hasSmtpConfig()) {
    return null
  }

  const config = getMailConfig()
  const nextCacheKey = [config.host, config.port, config.user, config.pass].join('|')

  if (!transporter || transporterCacheKey !== nextCacheKey) {
    const numericPort = Number(config.port)
    transporter = nodemailer.createTransport({
      host: config.host,
      port: numericPort,
      secure: numericPort === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    })
    transporterCacheKey = nextCacheKey
  }

  return transporter
}

const sendMail = async ({ to, subject, html, text, attachments = [] }) => {
  const activeTransporter = getTransporter()
  if (!activeTransporter) {
    throw new Error('SMTP is not configured. Set SMTP_* or EMAIL_* variables in backend env')
  }

  const { from } = getMailConfig()
  try {
    return await activeTransporter.sendMail({
      from,
      to,
      subject,
      html,
      text,
      attachments,
    })
  } catch (error) {
    const isAuthFailure = error?.code === 'EAUTH' || Number(error?.responseCode) === 535
    if (isAuthFailure) {
      transporter = null
      transporterCacheKey = ''
      throw new Error(
        'SMTP authentication failed (535). For Gmail, enable 2-Step Verification and use a fresh 16-character App Password in EMAIL_PASSWORD/SMTP_PASS.'
      )
    }

    throw error
  }
}

module.exports = {
  hasSmtpConfig,
  sendMail,
}
