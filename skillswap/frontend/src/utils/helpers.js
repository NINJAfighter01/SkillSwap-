// Common utility functions

export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text
  return text.substr(0, length) + '...'
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export const calculateTimeSince = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  
  let interval = Math.floor(seconds / 31536000)
  if (interval > 1) return interval + ' years ago'
  
  interval = Math.floor(seconds / 2592000)
  if (interval > 1) return interval + ' months ago'
  
  interval = Math.floor(seconds / 86400)
  if (interval > 1) return interval + ' days ago'
  
  interval = Math.floor(seconds / 3600)
  if (interval > 1) return interval + ' hours ago'
  
  interval = Math.floor(seconds / 60)
  if (interval > 1) return interval + ' minutes ago'
  
  return 'just now'
}

export const getInitials = (name) => {
  return name
    ?.split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase() || 'U'
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const generateToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export const downloadFile = (content, filename, type = 'text/plain') => {
  const element = document.createElement('a')
  element.setAttribute('href', `data:${type};charset=utf-8,${encodeURIComponent(content)}`)
  element.setAttribute('download', filename)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}
