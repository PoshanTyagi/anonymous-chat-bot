const {Model} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
    }

    User.init(
        {
            userId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            noOfReports: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            isBlocked: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            blockReason: {
                type: DataTypes.STRING,
                allowNull: true
            },
            blockDateTime: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            sequelize,
            tableName: 'users',
            modelName: 'User',
        }
    )
    return User
}