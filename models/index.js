const Sequelize = require('sequelize');
const fs = require('fs');
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

fs.readdirSync(__dirname)
    .filter(function (file) {
        return file !== 'index.js';
    })
    .forEach(function (file) {
        const model = require(`./${file}`)(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

db.sequelize = sequelize;

module.exports = db;