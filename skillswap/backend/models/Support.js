const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Support = sequelize.define(
  'Support',
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
    ticketId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'general',
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'normal',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'open',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = Support
