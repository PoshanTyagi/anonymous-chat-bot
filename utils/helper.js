const client = require('../index');

module.exports.sendMessage = async (userId, message) => {
    const user = await client.users.fetch(userId);
    return await user.send({
        content: message,
        embeds: []
    });
}