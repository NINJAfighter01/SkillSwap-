const errorHandler = (err, req, res, next) => {
  console.error(err)

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
