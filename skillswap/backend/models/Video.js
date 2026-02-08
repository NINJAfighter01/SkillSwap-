const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Video = sequelize.define(
  'Video',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uploaderId: {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    skillTag: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    level: {
      type: DataTypes.STRING,
      defaultValue: 'Beginner',
      validate: {
        isIn: [['Beginner', 'Intermediate', 'Advanced', 'Expert']]
      }
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER, // Duration in seconds
      defaultValue: 0,
    },
    visibility: {
      type: DataTypes.STRING,
      defaultValue: 'public',
      validate: {
        isIn: [['public', 'private', 'premium']]
      }
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tokensRequired: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // For premium videos
    },
    cloudinaryPublicId: {
      type: DataTypes.STRING,
      allowNull: true, // For deletion from Cloudinary
    },
  },
  {
    timestamps: true,
  }
)

module.exports = Video
