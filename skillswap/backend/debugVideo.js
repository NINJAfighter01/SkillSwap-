const Video = require('./models/Video');
const User = require('./models/User');

async function debugVideo() {
  try {
    const videos = await Video.findAll();
    
    console.log('=== ALL VIDEOS in DATABASE ===');
    if (videos.length === 0) {
      console.log('No videos found in database');
    } else {
      videos.forEach(video => {
        console.log(`\nVideo ID: ${video.id}`);
        console.log(`Title: ${video.title}`);
        console.log(`uploaderId: ${video.uploaderId} (Type: ${typeof video.uploaderId})`);
      });
    }
    
    // Also check users
    const users = await User.findAll();
    console.log('\n\n=== ALL USERS IN DATABASE ===');
    users.forEach(u => {
      console.log(`User ID: ${u.id} (Type: ${typeof u.id}), Name: ${u.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugVideo();
