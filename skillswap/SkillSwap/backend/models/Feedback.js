const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Feedback extends Model {}

Feedback.init({
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
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Feedback',
    tableName: 'feedback',
    timestamps: true
});

module.exports = Feedback;