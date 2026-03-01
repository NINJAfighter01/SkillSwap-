const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const VideoNote = sequelize.define(
  'VideoNote',
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    noteUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    noteFileName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    noteText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = VideoNote
