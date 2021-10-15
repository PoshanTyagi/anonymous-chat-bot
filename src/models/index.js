const Sequelize = require('sequelize');
const db = {};

let sequelize;

if (process.env.DB_TYPE === 'POSTGRES') {
    sequelize = new Sequelize.Sequelize(`postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
} else {
    sequelize = new Sequelize.Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite'
    });
}

db.User = require('./user')(sequelize, Sequelize.DataTypes);

db.Request = require('./request')(sequelize, Sequelize.DataTypes);

db.Match = require('./match')(sequelize, Sequelize.DataTypes);

db.sequelize = sequelize;

module.exports = db;