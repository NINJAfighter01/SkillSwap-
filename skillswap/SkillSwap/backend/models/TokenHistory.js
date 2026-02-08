const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class TokenHistory extends Model {}

TokenHistory.init({
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
  transactionType: {
    type: DataTypes.ENUM('earn', 'spend'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'TokenHistory',
  tableName: 'token_history',
  timestamps: false,
});

module.exports = TokenHistory;