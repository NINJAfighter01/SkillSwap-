const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Progress = sequelize.define(
  'Progress',
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
    lectureId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Lectures',
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

module.exports = Progress
