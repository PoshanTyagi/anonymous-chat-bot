const sequelize = require('../config/db');
const {readdirSync} = require('fs');

let db = {};

readdirSync(__dirname)
    .filter(function (file) {
        return file !== 'index.js';
    })
    .forEach(function (file) {
        const model = require(`./${file}`);
        db[model.name] = model;
    });

db.sequelize = sequelize;

module.exports = db;