const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Contact extends Model {}

Contact.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Contact',
  tableName: 'contacts',
  timestamps: true,
});

module.exports = Contact;