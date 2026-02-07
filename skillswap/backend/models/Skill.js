const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Skill = sequelize.define(
  'Skill',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      // Categories: Programming, Design, Music, Fitness, Electronics, Languages, Business, etc.
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    averageRating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isTrending: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = Skill
