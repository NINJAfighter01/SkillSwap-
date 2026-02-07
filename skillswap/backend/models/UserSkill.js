const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')
const Skill = require('./Skill')

const UserSkill = sequelize.define(
  'UserSkill',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    skillId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Skill,
        key: 'id',
      },
    },
    proficiencyLevel: {
      type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert'),
      defaultValue: 'Beginner',
    },
    type: {
      type: DataTypes.ENUM('teach', 'learn'),
      allowNull: false,
      // teach = user is a mentor, learn = user wants to learn
    },
    hoursSpent: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    sessionsCompleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Set up associations
UserSkill.belongsTo(User, { foreignKey: 'userId' })
UserSkill.belongsTo(Skill, { foreignKey: 'skillId' })
User.hasMany(UserSkill, { foreignKey: 'userId' })
Skill.hasMany(UserSkill, { foreignKey: 'skillId' })

module.exports = UserSkill
