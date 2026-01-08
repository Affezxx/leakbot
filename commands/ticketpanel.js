const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
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
                flags: MessageFlags.Ephemeral
            });
        }

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

        const container = new ContainerBuilder()
            .setAccentColor(0xFF0000)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# Hopeleaks\n\nHey, wenn du ein Ticket erstellen möchtest, wähle unten die passende Kategorie aus.\nDie Anliegen sind unten aufgelistet.\n\n**Anliegen:**\n- 🛠️ - Support\n- 👥 - Team\n- 🤝 - Partner\n\n**Bitte beschreibe dein Anliegen so genau es geht, damit sich unser Team schnellstmöglich um dein Anliegen kümmern kann.**\n*✨ Unser Team wird sich umgehend um dich kümmern.*')
            )
            .addActionRowComponents(row);

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },
};

