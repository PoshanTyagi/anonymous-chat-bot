const {SlashCommandBuilder} = require('@discordjs/builders');
const {User, Request, Match} = require("../models");
const {sendMessage} = require('../utils/helper');
const {Op} = require("sequelize");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('new')
        .setDescription('Start New Random Chat'),
    async execute(interaction) {
        const userId = interaction.member.user.id;

        let user = (await User.findOrCreate({where: {userId: userId}, limit: 1}))[0];

        if (user.isBlocked === true) {
            return await interaction.reply({content: "You were blocked !!!", embeds: []});
        }

        let request = await Request.findOne({
            where: {
                userId: userId,
                isMatched: false
            },
            order: [['id', 'DESC']]
        })

        if (request != null) {
            return await interaction.reply({
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

            await sendMessage(otherUserId, "You are chat is closed.");
        }

        return await this.makeMatch(interaction, user, request);
    },
    async makeMatch(interaction, user, request) {
        let otherRequest = await Request.findOne({
            where: {
                userId: {[Op.ne]: user.userId},
                isMatched: false
            },
            order: [['id', 'ASC']]
        })

        if (otherRequest == null) {
            return await interaction.reply({
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

            await sendMessage(otherRequest.userId, "You are connected.");
            return await interaction.reply({content: "You are connected.", embeds: []});
        }
    }
};