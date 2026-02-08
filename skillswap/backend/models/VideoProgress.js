const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const VideoProgress = sequelize.define(
  'VideoProgress',
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
        model: 'Users',
        key: 'id',
      },
    },
    videoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Videos',
        key: 'id',
      },
    },
    completionPercentage: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = VideoProgress
