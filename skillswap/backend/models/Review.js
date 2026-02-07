const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')
const Skill = require('./Skill')

const Review = sequelize.define(
  'Review',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reviewerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    mentorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    skillId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Skill,
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    //  Categories: Teaching Quality, Communication, Punctuality, Knowledge
    category: {
      type: DataTypes.STRING,
      defaultValue: 'Overall',
    },
  },
  {
    timestamps: true,
  }
)

// Set up associations
Review.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' })
Review.belongsTo(User, { foreignKey: 'mentorId', as: 'mentor' })
Review.belongsTo(Skill, { foreignKey: 'skillId' })
User.hasMany(Review, { foreignKey: 'mentorId', as: 'receivedReviews' })
User.hasMany(Review, { foreignKey: 'reviewerId', as: 'givenReviews' })

module.exports = Review
