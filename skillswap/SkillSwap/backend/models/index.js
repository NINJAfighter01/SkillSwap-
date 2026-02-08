const { Sequelize } = require('sequelize');
const User = require('./User');
const Lecture = require('./Lecture');
const Note = require('./Note');
const Subscription = require('./Subscription');
const Payment = require('./Payment');
const TokenHistory = require('./TokenHistory');
const Progress = require('./Progress');
const Feedback = require('./Feedback');
const Contact = require('./Contact');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database/skillswap.db',
});

const models = {
  User: User(sequelize),
  Lecture: Lecture(sequelize),
  Note: Note(sequelize),
  Subscription: Subscription(sequelize),
  Payment: Payment(sequelize),
  TokenHistory: TokenHistory(sequelize),
  Progress: Progress(sequelize),
  Feedback: Feedback(sequelize),
  Contact: Contact(sequelize),
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, models };