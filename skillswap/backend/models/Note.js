const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Note = sequelize.define(
  'Note',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    topicName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lectureId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Lectures',
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
    files: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('files')
        if (!rawValue) return []
        try {
          return JSON.parse(rawValue)
        } catch (e) {
          return []
        }
      },
      set(value) {
        this.setDataValue('files', JSON.stringify(value || []))
      }
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('tags')
        if (!rawValue) return []
        try {
          return JSON.parse(rawValue)
        } catch (e) {
          return []
        }
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []))
      },
    },
    folder: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'General',
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isShared: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = Note
