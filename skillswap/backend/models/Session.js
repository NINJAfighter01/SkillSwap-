const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')
const Skill = require('./Skill')

const Session = sequelize.define(
  'Session',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    mentorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    learnerId: {
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    scheduleDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      // Duration in minutes
      defaultValue: 60,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'),
      defaultValue: 'Pending',
    },
    sessionType: {
      type: DataTypes.ENUM('OneToOne', 'Group'),
      defaultValue: 'OneToOne',
    },
    meetingLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    mentorRating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    learnerRating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
)

// Set up associations
Session.belongsTo(User, { foreignKey: 'mentorId', as: 'mentor' })
Session.belongsTo(User, { foreignKey: 'learnerId', as: 'learner' })
Session.belongsTo(Skill, { foreignKey: 'skillId' })
User.hasMany(Session, { foreignKey: 'mentorId', as: 'mentorSessions' })
User.hasMany(Session, { foreignKey: 'learnerId', as: 'learnerSessions' })
Skill.hasMany(Session, { foreignKey: 'skillId' })

module.exports = Session
