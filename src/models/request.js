const {Model} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
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
    return Request
}