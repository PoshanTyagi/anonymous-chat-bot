const {Model} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Match extends Model {
    }

    Match.init(
        {
            firstUserId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            secondUserId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            closedBy: {
                type: DataTypes.STRING,
                allowNull: true
            },
            closedMethod: {
                type: DataTypes.STRING(10),
                allowNull: true
            },
            reportReason: {
                type: DataTypes.STRING,
                allowNull: true
            }
        },
        {
            sequelize,
            tableName: 'matches',
            modelName: 'Match',
        }
    )
    return Match
}