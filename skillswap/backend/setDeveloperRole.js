const sequelize = require('./config/database')

async function setDeveloperRole() {
  try {
    await sequelize.authenticate()
    await sequelize.query("UPDATE Users SET role = 'developer' WHERE role IS NULL OR role = '' OR role = 'user'")

    const [rows] = await sequelize.query('SELECT id, name, email, role FROM Users')
    console.log('Updated users:')
    console.table(rows)
  } catch (error) {
    console.error('Failed to update roles:', error)
    process.exitCode = 1
  } finally {
    await sequelize.close()
  }
}

setDeveloperRole()
