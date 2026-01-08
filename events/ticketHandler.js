const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
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
                    flags: MessageFlags.Ephemeral
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

                const container = new ContainerBuilder()
                    .setAccentColor(selectedType.color === '#ff0000' ? 0xff0000 : 0x00aaff)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ${selectedType.emoji} Ticket: ${selectedType.name}\n\n👋 Hey <@${interaction.user.id}>,\n\nDanke für deine Anfrage!\nBitte beschreibe dein Anliegen so detailliert wie möglich.\nUnser Team wird sich schnellstmöglich darum kümmern.\n\n📝 **Ticket Information:**\n• Kategorie: ${selectedType.name}\n• Erstellt von: <@${interaction.user.id}>\n• Erstellt am: <t:${timestamp}:F>`)
                    )
                    .addActionRowComponents(row);

                await ticketChannel.send({
                    components: [container],
                    flags: MessageFlags.IsComponentsV2
                });


                await interaction.reply({
                    content: `✅ Dein Ticket wurde erstellt: ${ticketChannel}`,
                    flags: MessageFlags.Ephemeral
                });

            } catch (error) {
                console.error('Fehler beim Erstellen des Tickets:', error);
                await interaction.reply({
                    content: '❌ Es gab einen Fehler beim Erstellen des Tickets. Bitte versuche es später erneut.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }

        if (interaction.customId === 'claim_ticket') {
            const container = new ContainerBuilder()
                .setAccentColor(0x2F3136)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`✅ Das Ticket wurde von <@${interaction.user.id}> übernommen!`)
                );

            await interaction.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });

            await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true
            });
        }

        if (interaction.customId === 'save_transcript') {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

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
                    files: [attachment]
                });

            } catch (error) {
                console.error('Fehler beim Erstellen des Transcripts:', error);
                await interaction.editReply({
                    content: '❌ Es gab einen Fehler beim Erstellen des Transcripts.'
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

                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                const transcriptPath = await TranscriptGenerator.generateTranscript(
                    interaction.channel,
                    Array.from(messages.values())
                );

                const attachment = new AttachmentBuilder(transcriptPath, {
                    name: `transcript-${interaction.channel.name}.html`
                });

                const channelParts = interaction.channel.name.split('-');
                const creatorUsername = channelParts.slice(1, -1).join('-');
                const creator = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === creatorUsername.toLowerCase());

                const closeContainer = new ContainerBuilder()
                    .setAccentColor(0xff0000)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🔒 Ticket wird geschlossen\n\nDas Ticket wurde von <@${interaction.user.id}> geschlossen.\nDas Transcript wurde gespeichert.\nDer Channel wird in 5 Sekunden gelöscht...`)
                    );

                const logContainer = new ContainerBuilder()
                    .setAccentColor(0x2F3136)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 📑 Ticket Transcript\n\n**Ticket Information**\n• Ticket: ${interaction.channel.name}\n• Geschlossen von: <@${interaction.user.id}>\n• Erstellt von: ${creator ? `<@${creator.id}>` : creatorUsername}\n• Geschlossen am: <t:${Math.floor(Date.now() / 1000)}:F>\n\nEin Transcript des Tickets wurde angehängt.`)
                    );

                await logChannel.send({
                    components: [logContainer],
                    flags: MessageFlags.IsComponentsV2
                });

                await logChannel.send({
                    files: [attachment]
                });

                if (creator) {
                    try {
                        const dmContainer = new ContainerBuilder()
                            .setAccentColor(0x00aaff)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`## 📑 Dein Ticket Transcript\n\nDein Ticket **${interaction.channel.name}** wurde geschlossen.\nHier ist ein Transcript deiner Konversation.`)
                            );

                        await creator.send({
                            components: [dmContainer],
                            flags: MessageFlags.IsComponentsV2
                        });

                        await creator.send({
                            files: [attachment]
                        });
                    } catch (dmError) {
                        console.log(`Konnte keine DM an ${creator.user.tag} senden.`);
                    }
                }

                await interaction.reply({
                    components: [closeContainer],
                    flags: MessageFlags.IsComponentsV2
                });

                setTimeout(() => {
                    interaction.channel.delete()
                        .catch(error => console.error('Fehler beim Löschen des Tickets:', error));
                }, 5000);

            } catch (error) {
                console.error('Fehler beim Schließen des Tickets:', error);
                await interaction.reply({
                    content: '❌ Es gab einen Fehler beim Schließen des Tickets.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
};