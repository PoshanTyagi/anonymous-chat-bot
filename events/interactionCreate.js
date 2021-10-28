require('dotenv').config();
const client = require('../index');

module.exports = {
    data: {
        name: 'interactionCreate'
    },

    async run(interaction) {
        if (!interaction.isCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            if (error) console.error(error);
            await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
        }
    }
}