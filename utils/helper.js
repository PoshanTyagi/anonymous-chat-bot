module.exports.sendMessage = async (client, userId, message) => {
    const user = await client.users.fetch(userId);
    return await user.send({
        content: message,
        embeds: []
    });
}