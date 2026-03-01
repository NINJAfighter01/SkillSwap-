const sequelize = require('./config/database')

async function run() {
  try {
    await sequelize.authenticate()

    await sequelize.query("UPDATE Lectures SET videoUrl = '/video/motivational-quote.3840x2160.mp4'")

    const [rows] = await sequelize.query('SELECT id, title, videoUrl FROM Lectures ORDER BY id')
    console.log('Updated lecture video URLs:')
    console.table(rows)
  } catch (error) {
    console.error('Failed to update lecture URLs:', error)
    process.exitCode = 1
  } finally {
    await sequelize.close()
  }
}

run()
