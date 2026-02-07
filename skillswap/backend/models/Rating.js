const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')
const UserSkill = require('./UserSkill')

const Rating = sequelize.define(
  'Rating',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ratedById: {
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
    userSkillId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: UserSkill,
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
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
)

// Set up associations
Rating.belongsTo(User, { foreignKey: 'ratedById', as: 'ratedBy' })
Rating.belongsTo(User, { foreignKey: 'mentorId', as: 'mentor' })
Rating.belongsTo(UserSkill, { foreignKey: 'userSkillId' })
User.hasMany(Rating, { foreignKey: 'mentorId', as: 'ratings' })
User.hasMany(Rating, { foreignKey: 'ratedById', as: 'givenRatings' })

module.exports = Rating
