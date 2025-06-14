const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');
const { requiredRoleId } = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketpanel')
        .setDescription('Erstellt das Ticket-Panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            return await interaction.reply({
                content: '❌ Du hast nicht die erforderlichen Berechtigungen für diesen Command!',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('Hopeleaks')
            .setColor('#FF0000')
            .setDescription('Hey, wenn du ein Ticket erstellen möchtest, wähle unten die passende Kategorie aus.\nDie Anliegen sind unten aufgelistet.\n\n**Anliegen:**\n- 🛠️ - Support\n- 👥 - Team\n- 🤝 - Partner\n\n**Bitte beschreibe dein Anliegen so genau es geht, damit sich unser Team schnellstmöglich um dein Anliegen kümmern kann.**\n*✨ Unser Team wird sich umgehend um dich kümmern.*')
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_category')
                    .setPlaceholder('Bitte wähle einen Grund aus.')
                    .addOptions([
                        {
                            label: 'Support',
                            description: 'Erstelle ein Support-Ticket',
                            value: 'support',
                            emoji: '🛠️'
                        },
                        {
                            label: 'Team',
                            description: 'Erstelle ein Team-Ticket',
                            value: 'team',
                            emoji: '👥'
                        },
                        {
                            label: 'Partner',
                            description: 'Erstelle ein Partner-Ticket',
                            value: 'partner',
                            emoji: '🤝'
                        },
                    ]),
            );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    },
};