require('dotenv').config();
const Discord = require('discord.js');

const {Op} = require('sequelize');
const {sequelize, User, Request, Match} = require('./models');

const {Client, Intents} = Discord;

const client = new Client({
    intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
    partials: ['CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'USER']
});

// sequelize.sync();
// sequelize.sync({alter: true});
sequelize.sync({force: true});

client.on('ready', () => {
    console.log("The bot is ready!");
});


client.on('messageCreate', async (message) => {

    if(message.author.id === client.user.id)
        return;

    const userId = message.author.id;

    let user = (await User.findOrCreate({where: {userId: userId}, limit: 1}))[0];

    if (user.isBlocked === true) {
        return await sendMessage(userId, "You were blocked !!!");
    }

    if (message.content === '!new') {
        let request = await Request.findOne({
            where: {
                userId: userId,
                isMatched: false
            },
            order: [['id', 'DESC']]
        })

        if (request != null) {
            return await sendMessage(userId, "Please wait we are trying to match you with other users.");
        }

        request = await Request.create({userId: userId});

        let match = await Match.findOne({
            where: {
                isActive: true,
                [Op.or]: [
                    {firstUserId: userId},
                    {secondUserId: userId}
                ]
            }
        });

        if (match != null) {
            match.isActive = false;
            match.closedBy = userId;
            match.closedMethod = 'NEW';
            await match.save();

            let otherUserId;

            if (match.firstUserId === userId) {
                otherUserId = match.secondUserId;
            } else {
                otherUserId = match.firstUserId;
            }

            await sendMessage(otherUserId,  "You are chat is closed.");
        }

        return await make_match(user, request);
    } else {
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
            return await sendMessage(userId, "Currently you are not match with any user. Try '!new' for new anonymous chat.");
        }

        let otherUserId;

        if (match.firstUserId === userId)
            otherUserId = match.secondUserId;
        else
            otherUserId = match.firstUserId;

        return await sendMessage(otherUserId, message.content);
    }
});


const make_match = async (user, request) => {
    let otherRequest = await Request.findOne({
        where: {
            userId: {[Op.ne]: user.userId},
            isMatched: false
        },
        order: [['id', 'ASC']]
    })

    if (otherRequest == null) {
        await sendMessage(user.userId, "Please wait we are trying to match you with other users.");
    } else {
        await Match.create({firstUserId: user.userId, secondUserId: otherRequest.userId});
        await Request.update({isMatched: true}, {
            where: {
                [Op.or]: [
                    {id: request.id},
                    {id: otherRequest.id}
                ]
            }
        });

        await sendMessage(user.userId, "You are connected.");
        await sendMessage(otherRequest.userId, "You are connected.");
    }
}

const sendMessage = async (userId, message) => {
    const user = await client.users.fetch(userId);
    return await user.send({
        content: message,
        embeds: []
    });
}

client.login(process.env.TOKEN).then();