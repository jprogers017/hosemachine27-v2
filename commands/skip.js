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
            description: "indicates u would like the current song skipped, and initiates a vote skip (number depending on how many in the channel, 2/3 majority"
        }
    });

    const logContent = `<@${message.member.id}> voted to skip the current song {vote #}`;
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
    name: `${prefix}skip`,
    description: `indicates u would like the current song skipped, and initiates a vote skip (number depending on how many in the channel, 2/3 majority`,
    type: `member`,
    usage: `${prefix}skip, ${prefix}skip [?]`,
    developmentStage: "unfinished"
}