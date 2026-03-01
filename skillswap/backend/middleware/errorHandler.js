const errorHandler = (err, req, res, next) => {
  console.error(err)

  const errorText = String(err?.message || '')
  const isEmailAuthError = /invalid login|badcredentials|\b535\b|smtp authentication failed|\beauth\b/i.test(errorText)
  if (isEmailAuthError) {
    return res.status(502).json({
      message: 'Email service authentication failed. Please switch to a stable SMTP provider (Brevo/SendGrid) or use a permitted sender account.',
    })
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map((e) => e.message),
    })
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: 'This email is already registered',
    })
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  })
}

module.exports = errorHandler
