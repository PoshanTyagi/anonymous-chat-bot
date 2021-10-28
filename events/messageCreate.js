require('dotenv').config();
const client = require('../index');
const {User, Match} = require("../models");
const {sendMessage} = require('../utils/helper');
const {Op} = require("sequelize");

module.exports = {
    data: {
        name: 'messageCreate'
    },

    async run(message) {

        if (message.author.id === client.user.id)
            return;

        const userId = message.author.id;

        let user = (await User.findOrCreate({where: {userId: userId}, limit: 1}))[0];

        if (user.isBlocked === true) {
            return await sendMessage(userId, "You were blocked !!!");
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
            return await sendMessage(userId, "Currently you are not match with any user. Try '!new' for new anonymous chat.");
        }

        let otherUserId;

        if (match.firstUserId === userId)
            otherUserId = match.secondUserId;
        else
            otherUserId = match.firstUserId;

        return await sendMessage(otherUserId, message.content);
    }
}