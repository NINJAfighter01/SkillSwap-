const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Lecture = sequelize.define(
  'Lecture',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fullDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    isPremium: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isLive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = Lecture
// Association for Video
const Video = require('./Video');
Lecture.hasOne(Video, { foreignKey: 'lectureId', as: 'Video' });
Video.belongsTo(Lecture, { foreignKey: 'lectureId', as: 'Lecture' });
