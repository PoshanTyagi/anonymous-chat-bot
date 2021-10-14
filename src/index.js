require('dotenv').config();
const Discord = require('discord.js');

const {Client, Intents} = Discord;

const {Op} = require('sequelize');
const {sequelize, User, Request, Match} = require('./models');

const client = new Client({
    intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
    partials: ['CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'USER']
});

// sequelize.sync();
// sequelize.sync({alter: true});
sequelize.sync({force: true});

client.on('ready', () => {
    console.log("Bot is Ready");
});


client.on('messageCreate', async (message) => {

    const userId = message.author.id;

    let user = (await User.findOrCreate({where: {userId: userId}, limit: 1}))[0];

    if (user.isBlocked === true) {
        return await client.users.cache.get(userId).send({content: "You were blocked !!!", embeds: []});
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
            return await client.users.cache.get(userId).send({
                content: "Please wait we are trying to match you with other users.",
                embeds: []
            });
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

            await client.users.cache.get(otherUserId).send({
                content: "You are chat is closed.",
                embeds: []
            });
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
            return await client.users.cache.get(userId).send({
                content: "Currently you are not match with any user. Try '!new' for new anonymous chat.",
                embeds: []
            });
        }

        let otherUserId;

        if (match.firstUserId === userId)
            otherUserId = match.secondUserId;
        else
            otherUserId = match.firstUserId;

        return await client.users.cache.get(otherUserId).send({
            content: message.content,
            embeds: []
        });
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
        await client.users.cache.get(user.userId).send({
            content: "Please wait we are trying to match you with other users.",
            embeds: []
        });
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

        await client.users.cache.get(user.userId).send({
            content: "You are connected.",
            embeds: []
        });

        await client.users.cache.get(otherRequest.userId).send({
            content: "You are connected.",
            embeds: []
        });
    }
}

client.login(process.env.TOKEN).then();