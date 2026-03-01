const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const VideoReport = sequelize.define(
  'VideoReport',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    videoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Videos',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Other',
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'open',
      validate: {
        isIn: [['open', 'reviewed', 'resolved']],
      },
    },
  },
  {
    timestamps: true,
  }
)

module.exports = VideoReport
