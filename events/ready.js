require('dotenv').config();
const client = require('../index');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const {sequelize} = require('../models');

module.exports = {
    data: {
        name: 'ready'
    },

    run() {
        console.log("The bot is ready!");

        // sequelize.sync();
        // sequelize.sync({alter: true});
        sequelize.sync({force: true});

        const CLIENT_ID = client.user.id;

        const rest = new REST({
            version: '9'
        }).setToken(process.env.TOKEN);
        (async () => {
            try {
                if (!process.env.TEST_GUILD_ID) {
                    await rest.put(
                        Routes.applicationCommands(CLIENT_ID), {
                            body: client.commandData
                        },
                    );
                    console.log('Successfully registered application commands globally');
                } else {
                    await rest.put(
                        Routes.applicationGuildCommands(CLIENT_ID, process.env.TEST_GUILD_ID), {
                            body: client.commandData
                        },
                    );
                    console.log('Successfully registered application commands for development guild');
                }
            } catch (error) {
                if (error) console.error(error);
            }
        })();
    }
}