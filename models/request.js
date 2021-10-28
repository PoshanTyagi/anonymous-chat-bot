const sequelize = require('../config/db');
const {Model, DataTypes} = require('sequelize');

class Request extends Model {
}

Request.init(
    {
        userId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isMatched: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        sequelize,
        tableName: 'requests',
        modelName: 'Request',
    }
)

module.exports = Request;