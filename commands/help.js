const Discord = require("discord.js");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

module.exports.run = async (client, message, args) => {
    const serverLogs = client.channels.get(config.myServerLogs);
    const externalLogs = client.guilds.get(config.myServerID).channels.get(config.externalServerLogs);

    if (message.member.nickname) {
        var authorName = message.member.nickname;
    } else {
        var authorName = message.author.username;
    }
    let helpEmbed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username}'s help page! u need help, ${authorName}?`, message.author.avatarURL)
        .setTitle(`__usage: ${config.prefix}command *<required>, [optional]*__`)
        .setColor(message.member.displayHexColor)
        .setFooter(`UNDER CONSTRUCTION: for command specific help, do the command with "?" afterwards, for example, ${config.prefix}hello ?`, );

    client.commands.forEach(c => {
        helpEmbed.addField(`${c.help.name} - *usage: ${c.help.usage}* **(${c.help.developmentStage})**`, c.help.description);
    });
    message.channel.send(helpEmbed);

    const logContent = `<@${message.member.id}> asked for help!`;
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
    name: `${config.prefix}help`,
    description: `shows the list of all the commands`,
    usage: `${config.prefix}help`
}