#!/usr/bin/env node

/**
 * Database Seeding Script
 * Run: npm run seed
 * 
 * This script populates the SkillSwap database with:
 * - 27 sample skills across 6 categories
 * - 5 sample mentor users
 * - Skill assignments for each mentor
 */

require('dotenv').config()
const sequelize = require('../config/database')
const seedSkills = require('./seed')

const runSeed = async () => {
  try {
    console.log('🔄 Syncing database...')
    await sequelize.sync({ alter: true })
    console.log('✅ Database synced')

    console.log('\n🌱 Running seeders...')
    await seedSkills()

    console.log('\n✅ Seeding completed!')
    await sequelize.close()
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

runSeed()
