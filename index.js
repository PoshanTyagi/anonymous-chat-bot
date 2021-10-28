require('dotenv').config();
const Client = require('./client');
const { Intents } = require('discord.js');

const client = new Client({
    intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
    partials: ['CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'USER']
});

client.init().then();

client.once('ready', () => client.events.get('ready').run());
client.on('interactionCreate', async (interaction) => await client.events.get('interactionCreate').run(interaction));
client.on('messageCreate', async (message) => await client.events.get('messageCreate').run(message));

module.exports = client;