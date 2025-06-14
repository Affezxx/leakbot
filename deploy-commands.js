const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log('Slash Commands werden aktualisiert...');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Slash Commands wurden erfolgreich aktualisiert!');
    } catch (error) {
        console.error(error);
    }
})();