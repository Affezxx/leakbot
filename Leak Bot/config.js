require('dotenv').config();

module.exports = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    requiredRoleId: process.env.REQUIRED_ROLE_ID,
    welcomeChannelId: process.env.WELCOME_CHANNEL_ID,
    ticketCategoryId: process.env.TICKET_CATEGORY_ID,
    ticketLogsChannelId: process.env.TICKET_LOGS_CHANNEL_ID
};