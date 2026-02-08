const ACTIVITY_LOG_KEY = 'skillswap_activity_log'

const normalizeLog = (log) => (Array.isArray(log) ? log : [])

const getTodayKey = () => new Date().toISOString().split('T')[0]

export const loadActivityLog = () => {
  try {
    const raw = localStorage.getItem(ACTIVITY_LOG_KEY)
    if (!raw) return []
    return normalizeLog(JSON.parse(raw))
  } catch (error) {
    console.error('Failed to load activity log:', error)
    return []
  }
}

export const saveActivityLog = (log) => {
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(log))
  window.dispatchEvent(new Event('activityLogUpdated'))
}

const updateDailyEntry = (log, dateKey, updater) => {
  const existing = log.find(entry => entry.date === dateKey)
  if (existing) {
    updater(existing)
    return log
  }

  const newEntry = {
    date: dateKey,
    coursesCompleted: 0,
    timeSpent: 0,
    tokensEarned: 0,
    tokensUsed: 0
  }
  updater(newEntry)
  return [...log, newEntry]
}

export const logCourseCompletion = (timeSpentHours = 1, tokensEarned = 0) => {
  const dateKey = getTodayKey()
  const current = loadActivityLog()
  const updated = updateDailyEntry(current, dateKey, (entry) => {
    entry.coursesCompleted += 1
    entry.timeSpent += timeSpentHours
    entry.tokensEarned += tokensEarned
  })
  saveActivityLog(updated)
  return updated
}

export const logTokenUsage = (tokensUsed = 0) => {
  if (!tokensUsed) return loadActivityLog()
  const dateKey = getTodayKey()
  const current = loadActivityLog()
  const updated = updateDailyEntry(current, dateKey, (entry) => {
    entry.tokensUsed += tokensUsed
  })
  saveActivityLog(updated)
  return updated
}

export const logTokenEarned = (tokensEarned = 0) => {
  if (!tokensEarned) return loadActivityLog()
  const dateKey = getTodayKey()
  const current = loadActivityLog()
  const updated = updateDailyEntry(current, dateKey, (entry) => {
    entry.tokensEarned += tokensEarned
  })
  saveActivityLog(updated)
  return updated
}
