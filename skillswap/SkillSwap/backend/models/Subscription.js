const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Subscription extends Model {}

Subscription.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  plan: {
    type: DataTypes.ENUM('Basic', 'Pro', 'Premium'),
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
}, {
  sequelize,
  modelName: 'Subscription',
  tableName: 'subscriptions',
  timestamps: true,
});

module.exports = Subscription;