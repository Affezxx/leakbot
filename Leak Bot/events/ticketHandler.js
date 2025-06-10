const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { ticketCategoryId, ticketLogsChannelId } = require('../config.js');
const TranscriptGenerator = require('../utils/transcriptGenerator.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

        if (interaction.customId === 'ticket_category') {
            const category = interaction.values[0];
            
            const ticketTypes = {
                support: { emoji: '🛠️', name: 'Support', color: '#ff0000' },
                team: { emoji: '👥', name: 'Team', color: '#ff0000' },
                partner: { emoji: '🤝', name: 'Partner', color: '#ff0000' }
            };

            const selectedType = ticketTypes[category];
            
            const timestamp = Math.floor(Date.now() / 1000);
            const channelName = `ticket-${interaction.user.username.toLowerCase()}-${timestamp}`;

            const existingTicket = interaction.guild.channels.cache.find(
                channel => channel.name.startsWith(`ticket-${interaction.user.username.toLowerCase()}`)
            );

            if (existingTicket) {
                return interaction.reply({
                    content: `❌ Du hast bereits ein offenes Ticket! ${existingTicket}`,
                    ephemeral: true
                });
            }

            try {
                const ticketChannel = await interaction.guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: ticketCategoryId,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory,
                                PermissionFlagsBits.AttachFiles
                            ],
                        }
                    ],
                });

                const embed = new EmbedBuilder()
                    .setColor(selectedType.color)
                    .setTitle(`${selectedType.emoji} Ticket: ${selectedType.name}`)
                    .setDescription(`
👋 Hey <@${interaction.user.id}>,

Danke für deine Anfrage! 
Bitte beschreibe dein Anliegen so detailliert wie möglich.
Unser Team wird sich schnellstmöglich darum kümmern.

📝 **Ticket Information:**
• Kategorie: ${selectedType.name}
• Erstellt von: <@${interaction.user.id}>
• Erstellt am: <t:${timestamp}:F>`)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('close_ticket')
                            .setLabel('Ticket schließen')
                            .setEmoji('🔒')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('save_transcript')
                            .setLabel('Transcript speichern')
                            .setEmoji('📑')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('claim_ticket')
                            .setLabel('Ticket übernehmen')
                            .setEmoji('✋')
                            .setStyle(ButtonStyle.Success)
                    );

                await ticketChannel.send({
                    embeds: [embed],
                    components: [row]
                });


                await interaction.reply({
                    content: `✅ Dein Ticket wurde erstellt: ${ticketChannel}`,
                    ephemeral: true
                });

            } catch (error) {
                console.error('Fehler beim Erstellen des Tickets:', error);
                await interaction.reply({
                    content: '❌ Es gab einen Fehler beim Erstellen des Tickets. Bitte versuche es später erneut.',
                    ephemeral: true
                });
            }
        }

        if (interaction.customId === 'claim_ticket') {
            const embed = new EmbedBuilder()
                .setColor('#2F3136')
                .setDescription(`✅ Das Ticket wurde von <@${interaction.user.id}> übernommen!`)
                .setTimestamp();

            await interaction.reply({
                embeds: [embed]
            });

            await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true
            });
        }

        if (interaction.customId === 'save_transcript') {
            await interaction.deferReply({ ephemeral: true });

            try {
                const messages = await interaction.channel.messages.fetch();
                
                const transcriptPath = await TranscriptGenerator.generateTranscript(
                    interaction.channel,
                    Array.from(messages.values())
                );

                const attachment = new AttachmentBuilder(transcriptPath, {
                    name: `transcript-${interaction.channel.name}.html`
                });

                await interaction.editReply({
                    content: '📑 Hier ist dein Transcript:',
                    files: [attachment],
                    ephemeral: true
                });

            } catch (error) {
                console.error('Fehler beim Erstellen des Transcripts:', error);
                await interaction.editReply({
                    content: '❌ Es gab einen Fehler beim Erstellen des Transcripts.',
                    ephemeral: true
                });
            }
        }

        if (interaction.customId === 'close_ticket') {
            try {
                const logChannel = interaction.guild.channels.cache.get(ticketLogsChannelId);
                if (!logChannel) {
                    console.error('Log Channel nicht gefunden!');
                    return;
                }

                const messages = await interaction.channel.messages.fetch();
                const transcriptPath = await TranscriptGenerator.generateTranscript(
                    interaction.channel,
                    Array.from(messages.values())
                );

                const attachment = new AttachmentBuilder(transcriptPath, {
                    name: `transcript-${interaction.channel.name}.html`
                });


                const closeEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('🔒 Ticket wird geschlossen')
                    .setDescription(`
Das Ticket wurde von <@${interaction.user.id}> geschlossen.
Das Transcript wurde gespeichert.
Der Channel wird in 5 Sekunden gelöscht...`)
                    .setTimestamp();


                const logEmbed = new EmbedBuilder()
                    .setColor('#2F3136')
                    .setTitle('📑 Ticket Transcript')
                    .setDescription(`
**Ticket Information**
• Ticket: ${interaction.channel.name}
• Geschlossen von: <@${interaction.user.id}>
• Erstellt von: <@${interaction.channel.name.split('-')[1]}>
• Geschlossen am: <t:${Math.floor(Date.now() / 1000)}:F>

Ein Transcript des Tickets wurde angehängt.`)
                    .setTimestamp();


                await logChannel.send({
                    embeds: [logEmbed],
                    files: [attachment]
                });


                await interaction.reply({
                    embeds: [closeEmbed]
                });


                setTimeout(() => {
                    interaction.channel.delete()
                        .catch(error => console.error('Fehler beim Löschen des Tickets:', error));
                }, 5000);

            } catch (error) {
                console.error('Fehler beim Schließen des Tickets:', error);
                await interaction.reply({
                    content: '❌ Es gab einen Fehler beim Schließen des Tickets.',
                    ephemeral: true
                });
            }
        }
    },
};