const Discord = require("discord.js");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
let prefix = config.prefix;

module.exports.run = async (client, message, args) => {
    const serverLogs = client.channels.get(config.myServerLogs);
    const externalLogs = client.guilds.get(config.myServerID).channels.get(config.externalServerLogs);

    message.channel.send({
        embed: {
            title: "This feature is under development.",
            color: 0x73b6ff,
            description: "sets the bot's overall volume"
        }
    });

    const logContent = `<@${message.member.id}> set the volume`;
    let logsEmbed = new Discord.RichEmbed()
        .setAuthor(client.user.username, client.user.avatarURL)
        .setDescription(logContent)
        .addField('channel:', message.channel.name)
        .setColor(message.member.displayHexColor)
        .setThumbnail(message.author.avatarURL)
        .setTimestamp();
    if (message.guild.id == config.myServerID) {
        serverLogs.send(logsEmbed);
    } else {
        logsEmbed.addField('server (owner):', `${message.guild.name} (${message.guild.owner})`, true)
        externalLogs.send(logsEmbed);
    }
}

module.exports.help = {
    name: `${prefix}volume`,
    description: `sets the bot's overall volume`,
    type: `admin`,
    usage: `${prefix}volume <number between 1 - 200%>, ${prefix}volume [?]`,
    developmentStage: "unfinished"
}