require('dotenv').config();
const Discord = require('discord.js');
const {Op} = require('sequelize');
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');

const {sequelize, User, Match} = require('./models');
const {sendMessage} = require('./utils/helper.js');

const {Client, Intents, Collection} = Discord;

const client = new Client({
    intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
    partials: ['CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'USER']
});

// sequelize.sync();
// sequelize.sync({alter: true});
sequelize.sync({force: true});

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const commands = [];

client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log("The bot is ready!");

    const CLIENT_ID = client.user.id;
    const rest = new REST({
        version: '9'
    }).setToken(process.env.TOKEN);
    (async () => {
        try {
            if (!process.env.TEST_GUILD_ID) {
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID), {
                        body: commands
                    },
                );
                console.log('Successfully registered application commands globally');
            } else {
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, process.env.TEST_GUILD_ID), {
                        body: commands
                    },
                );
                console.log('Successfully registered application commands for development guild');
            }
        } catch (error) {
            if (error) console.error(error);
        }
    })();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(client, interaction);
    } catch (error) {
        if (error) console.error(error);
        await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
    }
});


client.on('messageCreate', async (message) => {

    if (message.author.id === client.user.id)
        return;

    const userId = message.author.id;

    let user = (await User.findOrCreate({where: {userId: userId}, limit: 1}))[0];

    if (user.isBlocked === true) {
        return await sendMessage(client, userId, "You were blocked !!!");
    }
    let match = await Match.findOne({
        where: {
            isActive: true,
            [Op.or]: [
                {firstUserId: userId},
                {secondUserId: userId},
            ]
        }
    });

    if (match == null) {
        return await sendMessage(client, userId, "Currently you are not match with any user. Try '!new' for new anonymous chat.");
    }

    let otherUserId;

    if (match.firstUserId === userId)
        otherUserId = match.secondUserId;
    else
        otherUserId = match.firstUserId;

    return await sendMessage(client, otherUserId, message.content);
});

client.login(process.env.TOKEN).then();