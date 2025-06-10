const fs = require('fs').promises;
const path = require('path');

class TranscriptGenerator {
    static async generateTranscript(channel, messages) {
        const html = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket Transcript - ${channel.name}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: 20px auto;
            padding: 20px;
            background-color: #36393f;
            color: #dcddde;
        }
        .message {
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
            background-color: #2f3136;
        }
        .message-header {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }
        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .username {
            color: #ffffff;
            font-weight: bold;
        }
        .timestamp {
            color: #72767d;
            font-size: 0.8em;
            margin-left: 10px;
        }
        .content {
            margin-left: 50px;
            word-wrap: break-word;
        }
        .header {
            text-align: center;
            padding: 20px;
            background-color: #202225;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .embed {
            border-left: 4px solid #4f545c;
            margin: 5px 0;
            padding: 10px;
            background-color: #2f3136;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Ticket Transcript</h1>
        <p>Channel: ${channel.name}</p>
        <p>Erstellt: ${new Date().toLocaleString('de-DE')}</p>
    </div>
    ${messages.reverse().map(msg => `
        <div class="message">
            <div class="message-header">
                <img src="${msg.author.displayAvatarURL()}" alt="Avatar" class="avatar">
                <span class="username">${msg.author.tag}</span>
                <span class="timestamp">${msg.createdAt.toLocaleString('de-DE')}</span>
            </div>
            <div class="content">${msg.content || ''}</div>
            ${msg.embeds.map(embed => `
                <div class="content">
                    <div class="embed">
                        ${embed.title ? `<h3>${embed.title}</h3>` : ''}
                        ${embed.description ? `<p>${embed.description}</p>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('')}
</body>
</html>`;


        const transcriptsDir = path.join(__dirname, '..', 'transcripts');
        await fs.mkdir(transcriptsDir, { recursive: true });

        const fileName = `transcript-${channel.name}-${Date.now()}.html`;
        const filePath = path.join(transcriptsDir, fileName);
        
        await fs.writeFile(filePath, html);
        return filePath;
    }
}

module.exports = TranscriptGenerator;