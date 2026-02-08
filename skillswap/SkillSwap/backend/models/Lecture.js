const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lecture = sequelize.define('Lecture', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    videoUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tokensRequired: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = Lecture;