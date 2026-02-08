const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Progress extends Model {}

Progress.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  lectureId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lectures',
      key: 'id'
    }
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  progressPercentage: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  lastWatched: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Progress',
  tableName: 'progress',
  timestamps: true
});

module.exports = Progress;