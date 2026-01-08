const { MessageFlags } = require('discord.js');
const { requiredRoleId } = require('../config.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                if (command.requiresRole && !interaction.member.roles.cache.has(requiredRoleId)) {
                    return await interaction.reply({
                        content: '❌ Du hast nicht die erforderlichen Berechtigungen für diesen Command!',
                        flags: MessageFlags.Ephemeral
                    });
                }

                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: 'Bei der Ausführung des Commands ist ein Fehler aufgetreten!',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
};