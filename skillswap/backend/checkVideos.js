const sequelize = require('./config/database')
const Video = require('./models/Video')

async function checkVideos() {
  try {
    await sequelize.authenticate()
    console.log('✓ Connected to database')
    
    const count = await Video.count()
    console.log('Total Videos in DB:', count)
    
    const videos = await Video.findAll({ raw: true })
    console.log('\nAll Videos:')
    videos.forEach(v => {
      console.log(`  - ID: ${v.id}, Title: "${v.title}", Has URL: ${!!v.videoUrl}`)
    })
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

checkVideos()
