const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DB_TYPE === 'POSTGRES') {
    sequelize = new Sequelize(`postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
} else {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite'
    });
}

module.exports = sequelize;

