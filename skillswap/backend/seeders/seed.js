const { Skill, User, UserSkill } = require('./models')

const seedSkills = async () => {
  try {
    console.log('🌱 Starting database seeding...')

    // Clear existing skills and user-skills
    await Skill.destroy({ where: {} }, { force: true })
    await UserSkill.destroy({ where: {} })

    // Sample skills data
    const skillsData = [
      // Programming Category
      {
        title: 'JavaScript Basics',
        description: 'Learn the fundamentals of JavaScript, including variables, functions, loops, and DOM manipulation',
        category: 'Programming',
        icon: '💻',
        averageRating: 4.8,
        totalReviews: 45,
        isTrending: true
      },
      {
        title: 'React.js',
        description: 'Master React for building interactive user interfaces with components, hooks, and state management',
        category: 'Programming',
        icon: '⚛️',
        averageRating: 4.7,
        totalReviews: 38,
        isTrending: true
      },
      {
        title: 'Python for Beginners',
        description: 'Learn Python programming from scratch. Perfect for beginners interested in web development and data science',
        category: 'Programming',
        icon: '🐍',
        averageRating: 4.9,
        totalReviews: 52,
        isTrending: true
      },
      {
        title: 'Web Development with Node.js',
        description: 'Build robust backend applications using Node.js and Express. Learn REST APIs and database integration',
        category: 'Programming',
        icon: '🖥️',
        averageRating: 4.6,
        totalReviews: 31,
        isTrending: false
      },
      {
        title: 'Data Structures & Algorithms',
        description: 'Master essential algorithms and data structures needed for technical interviews and competitive programming',
        category: 'Programming',
        icon: '📊',
        averageRating: 4.8,
        totalReviews: 42,
        isTrending: false
      },
      {
        title: 'TypeScript Mastery',
        description: 'Learn TypeScript to build type-safe JavaScript applications with better tooling and error detection',
        category: 'Programming',
        icon: '📘',
        averageRating: 4.5,
        totalReviews: 25,
        isTrending: false
      },

      // Design Category
      {
        title: 'UI/UX Design Fundamentals',
        description: 'Learn the principles of user interface and user experience design for web and mobile applications',
        category: 'Design',
        icon: '🎨',
        averageRating: 4.8,
        totalReviews: 48,
        isTrending: true
      },
      {
        title: 'Figma Design',
        description: 'Master Figma for creating stunning user interfaces, prototypes, and design systems collaboratively',
        category: 'Design',
        icon: '🖌️',
        averageRating: 4.7,
        totalReviews: 35,
        isTrending: true
      },
      {
        title: 'Graphic Design with Adobe Creative Suite',
        description: 'Learn Photoshop, Illustrator, and InDesign to create professional graphics and visual content',
        category: 'Design',
        icon: '🎬',
        averageRating: 4.6,
        totalReviews: 29,
        isTrending: false
      },
      {
        title: 'Web Design Principles',
        description: 'Understand color theory, typography, layout, and responsive design for creating beautiful websites',
        category: 'Design',
        icon: '📱',
        averageRating: 4.7,
        totalReviews: 32,
        isTrending: false
      },

      // Music Category
      {
        title: 'Guitar for Beginners',
        description: 'Start your musical journey with guitar. Learn basic chords, strumming patterns, and popular songs',
        category: 'Music',
        icon: '🎸',
        averageRating: 4.9,
        totalReviews: 67,
        isTrending: true
      },
      {
        title: 'Piano Lessons',
        description: 'Learn to play piano from basics to intermediate level. Perfect for all ages and music preferences',
        category: 'Music',
        icon: '🎹',
        averageRating: 4.8,
        totalReviews: 54,
        isTrending: true
      },
      {
        title: 'Music Production & Beatmaking',
        description: 'Create music with modern DAWs, sampling, mixing, and mastering techniques for professional sound quality',
        category: 'Music',
        icon: '🎵',
        averageRating: 4.6,
        totalReviews: 26,
        isTrending: false
      },
      {
        title: 'Vocal Training & Singing',
        description: 'Improve your singing voice with proper breathing, pitch control, and performance techniques',
        category: 'Music',
        icon: '🎤',
        averageRating: 4.7,
        totalReviews: 38,
        isTrending: false
      },

      // Fitness Category
      {
        title: 'Personal Training & Fitness',
        description: 'Get personalized workout plans and nutrition advice to reach your fitness goals safely and effectively',
        category: 'Fitness',
        icon: '💪',
        averageRating: 4.9,
        totalReviews: 71,
        isTrending: true
      },
      {
        title: 'Yoga & Meditation',
        description: 'Learn yoga poses, breathing techniques, and meditation practices for flexibility, strength, and calm',
        category: 'Fitness',
        icon: '🧘',
        averageRating: 4.8,
        totalReviews: 49,
        isTrending: true
      },
      {
        title: 'Nutrition & Healthy Eating',
        description: 'Master nutrition science and meal planning to fuel your body for better health and athletic performance',
        category: 'Fitness',
        icon: '🥗',
        averageRating: 4.7,
        totalReviews: 35,
        isTrending: false
      },
      {
        title: 'HIIT & Cardio Training',
        description: 'High-intensity interval training and cardio workouts to build endurance and burn fat efficiently',
        category: 'Fitness',
        icon: '🏃',
        averageRating: 4.6,
        totalReviews: 28,
        isTrending: false
      },

      // Languages Category
      {
        title: 'English Speaking & Communication',
        description: 'Improve your English fluency, accent, and communication skills for professional and social contexts',
        category: 'Languages',
        icon: '🗣️',
        averageRating: 4.8,
        totalReviews: 56,
        isTrending: true
      },
      {
        title: 'Spanish for Beginners',
        description: 'Learn basic Spanish vocabulary, grammar, and conversational phrases for travel and daily interactions',
        category: 'Languages',
        icon: '🇪🇸',
        averageRating: 4.7,
        totalReviews: 41,
        isTrending: true
      },
      {
        title: 'French Language Lessons',
        description: 'Master French grammar, vocabulary, and pronunciation. Intermediate and advanced levels available',
        category: 'Languages',
        icon: '🇫🇷',
        averageRating: 4.6,
        totalReviews: 33,
        isTrending: false
      },
      {
        title: 'Chinese (Mandarin) Basics',
        description: 'Learn Mandarin Chinese characters, tones, and essential phrases for beginners and intermediate learners',
        category: 'Languages',
        icon: '🇨🇳',
        averageRating: 4.7,
        totalReviews: 29,
        isTrending: false
      },

      // Business Category
      {
        title: 'Digital Marketing & SEO',
        description: 'Learn digital marketing strategies, content creation, social media, and SEO to grow online businesses',
        category: 'Business',
        icon: '📈',
        averageRating: 4.8,
        totalReviews: 44,
        isTrending: true
      },
      {
        title: 'Business Communication & Public Speaking',
        description: 'Build confidence and master presentation skills for professional success and effective communication',
        category: 'Business',
        icon: '🎯',
        averageRating: 4.9,
        totalReviews: 39,
        isTrending: false
      },
      {
        title: 'Entrepreneurship & Startup Basics',
        description: 'Learn how to start and grow your own business, from idea validation to funding and scaling strategies',
        category: 'Business',
        icon: '🚀',
        averageRating: 4.7,
        totalReviews: 34,
        isTrending: false
      },
      {
        title: 'Project Management & Agile',
        description: 'Master project management methodologies, Agile frameworks, and team leadership for successful projects',
        category: 'Business',
        icon: '📋',
        averageRating: 4.6,
        totalReviews: 27,
        isTrending: false
      },

      // Electronics/IoT Category
      {
        title: 'Arduino Basics & Electronics',
        description: 'Learn electronics fundamentals and Arduino programming to build IoT projects and smart devices',
        category: 'Electronics',
        icon: '🤖',
        averageRating: 4.7,
        totalReviews: 32,
        isTrending: true
      },
      {
        title: 'Raspberry Pi Projects',
        description: 'Build exciting projects with Raspberry Pi including automation, programming, and robotics applications',
        category: 'Electronics',
        icon: '🍓',
        averageRating: 4.6,
        totalReviews: 24,
        isTrending: false
      },
      {
        title: 'Circuit Design & PCB Layout',
        description: 'Design electronic circuits and create professional PCBs for your projects using industry-standard tools',
        category: 'Electronics',
        icon: '⚡',
        averageRating: 4.5,
        totalReviews: 19,
        isTrending: false
      },
    ]

    // Seed skills
    await Skill.bulkCreate(skillsData)
    console.log(`✅ Created ${skillsData.length} skills`)

    // Create some mentor users and assign them skills
    const mentorDataArray = [
      {
        name: 'John Developer',
        email: 'john.dev@skillswap.com',
        password: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm', // password123
        bio: 'Full-stack developer with 10+ years of experience. Passionate about teaching JavaScript and React to beginners.',
        isTeacher: true,
        averageRating: 4.8,
        totalReviews: 45
      },
      {
        name: 'Sarah Designer',
        email: 'sarah.design@skillswap.com',
        password: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm',
        bio: 'UX/UI designer with 8 years of experience. Specialized in Figma and design systems. Love mentoring aspiring designers.',
        isTeacher: true,
        averageRating: 4.7,
        totalReviews: 38
      },
      {
        name: 'Mike Fitness',
        email: 'mike.fitness@skillswap.com',
        password: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm',
        bio: 'Certified personal trainer with a passion for helping people achieve their fitness goals through proper training and nutrition.',
        isTeacher: true,
        averageRating: 4.9,
        totalReviews: 71
      },
      {
        name: 'Alex Musician',
        email: 'alex.music@skillswap.com',
        password: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm',
        bio: 'Multi-instrumentalist and music teacher. Specializing in guitar lessons for beginners and intermediate students.',
        isTeacher: true,
        averageRating: 4.8,
        totalReviews: 52
      },
      {
        name: 'Emma Languages',
        email: 'emma.languages@skillswap.com',
        password: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm',
        bio: 'Polyglot speaker of 5 languages. Teaching Spanish and English with a focus on practical conversation skills.',
        isTeacher: true,
        averageRating: 4.7,
        totalReviews: 42
      }
    ]

    const mentorUsers = await User.bulkCreate(mentorDataArray)
    console.log(`✅ Created ${mentorUsers.length} mentor users`)

    // Assign skills to mentors
    const skillAssignments = [
      { userId: mentorUsers[0].id, skillIds: [1, 2, 5] }, // John: JavaScript, React, TypeScript
      { userId: mentorUsers[1].id, skillIds: [7, 8, 9] }, // Sarah: UI/UX, Figma, Graphic Design
      { userId: mentorUsers[2].id, skillIds: [15, 16, 17, 18] }, // Mike: Fitness related skills
      { userId: mentorUsers[3].id, skillIds: [11, 12, 13] }, // Alex: Guitar, Piano, Music Production
      { userId: mentorUsers[4].id, skillIds: [20, 21] } // Emma: English, Spanish
    ]

    for (const assignment of skillAssignments) {
      for (const skillId of assignment.skillIds) {
        await UserSkill.create({
          userId: assignment.userId,
          skillId: skillId,
          type: 'teach',
          proficiencyLevel: 'Expert',
          hoursSpent: Math.floor(Math.random() * 1000) + 500,
          rating: 4.5 + Math.random() * 0.5,
          sessionsCompleted: Math.floor(Math.random() * 50) + 20
        })
      }
    }

    console.log(`✅ Assigned skills to mentors`)

    console.log('🎉 Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

module.exports = seedSkills
