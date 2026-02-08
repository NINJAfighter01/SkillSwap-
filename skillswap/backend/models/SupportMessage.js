const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const SupportMessage = sequelize.define(
  'SupportMessage',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    supportId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Supports',
        key: 'id',
      },
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    senderType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attachment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isAIGenerated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = SupportMessage
