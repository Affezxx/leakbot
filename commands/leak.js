const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { requiredRoleId } = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leak')
        .setDescription('Zeigt Informationen an')
        .addStringOption(option =>
            option.setName('titel')
                .setDescription('Der Titel der Information')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('link')
                .setDescription('Der Download-Link')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            return await interaction.reply({
                content: '*Du besitzt nicht die erforderliche rolle, um diesen Command zu verwenden!*',
                ephemeral: true
            });
        }

        const title = interaction.options.getString('titel');
        const link = interaction.options.getString('link');
        
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle(title)
            .setDescription(`
> ℹ️ **Informationen:**
- Open Source
- Do not try to sell it

> 👤 **Erstellt von:**
- <@${interaction.user.id}>`)  
            .setTimestamp()
                        .setImage('https://cdn.discordapp.com/attachments/1241131307002499135/1317850358231470134/hopeleaksbanner_leak.png?ex=6846e5c9&is=68459449&hm=78a79bf7f68f7d78e4e4596d7301b0b8844a9fc851e5dcf50b5d190732211cdc&') 
            .setFooter({ 
                text: `Powered by ${interaction.client.user.username}`, 
                iconURL: interaction.client.user.displayAvatarURL() 
            });

        const downloadButton = new ButtonBuilder()
            .setLabel('📥 Datei herunterladen')
            .setStyle(ButtonStyle.Link)
            .setURL(link);

        const row = new ActionRowBuilder()
            .addComponents(downloadButton);

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    },
};
