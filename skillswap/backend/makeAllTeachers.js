// Quick script to make all existing users teachers
const sequelize = require('./config/database')
const User = require('./models/User')

async function makeAllTeachers() {
  try {
    await sequelize.authenticate()
    console.log('✓ Database connected')

    // Update all users to be teachers
    const result = await User.update(
      { isTeacher: true },
      { where: {} } // Empty where = update all
    )

    console.log(`✅ Updated ${result[0]} users to teachers!`)
    
    // Show all users
    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'isTeacher']
    })
    
    console.log('\n📋 All Users:')
    users.forEach(user => {
      console.log(`  ${user.email} - isTeacher: ${user.isTeacher}`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

makeAllTeachers()
