const Sequelize = require('sequelize');
const db = {};

let sequelize = new Sequelize.Sequelize(`postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

db.User = require('./user')(sequelize, Sequelize.DataTypes);

db.Request = require('./request')(sequelize, Sequelize.DataTypes);

db.Match = require('./match')(sequelize, Sequelize.DataTypes);

db.sequelize = sequelize;

module.exports = db;