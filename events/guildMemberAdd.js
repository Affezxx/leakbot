const { ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, ThumbnailBuilder, SectionBuilder, MessageFlags } = require('discord.js');
const { welcomeChannelId } = require('../config.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
        
        if (!welcomeChannel) return;

        const container = new ContainerBuilder()
            .setAccentColor(0xFF0000)
            .addSectionComponents(
                new SectionBuilder()
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# Willkommen auf ${member.guild.name}\n\nHey <@${member.id}> Willkommen auf unserem Server!\n\nDu findest hier verschiedene Bereiche und Channels für unsere Community.\nWenn du Fragen hast, wende dich gerne an das Server-Team.\n\nMit freundlichen Grüßen\n***Hopeleaks Team***`)
                    )
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL('https://media.discordapp.net/attachments/1241131307002499135/1317851927647617095/hopeleaksbanner.png?ex=6846e740&is=684595c0&hm=e7b05be88dc31b10acd9860b9dabb013eef545a45faa9968d6960a4c2fcd1e93&format=webp&quality=lossless&')
                    )
            );

        try {
            await welcomeChannel.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('Fehler beim Senden der Willkommensnachricht:', error);
        }
    },
};
