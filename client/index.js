require('dotenv').config();
const { readdirSync } = require('fs');
const path = require('path');
const { Client, Collection } = require('discord.js');

class ExtendedClient extends Client {
    constructor() {
        commands = new Collection();
        commandData = [];
        events = new Collection();
    }

    async init() {
        await this.login(process.env.TOKEN);

        console.log('Initializing the Bot');

        const commandPath = path.join(__dirname, "..", "commands");
        readdirSync(commandPath).forEach((file) => {
            const command = require(`${commandPath}/${file}`);
            this.commandData.push(command.data.toJSON());
            this.commands.set(command.data.name, command);
        });

        const eventPath = path.join(__dirname, "..", "events");
        readdirSync(eventPath).forEach((file) => {
            const event = require(`${eventPath}/${file}`);
            this.events.set(event.data.name, event);
        });
    }
}

module.exports = ExtendedClient;