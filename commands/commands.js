const Discord = require("discord.js");
const fs = require("fs");
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const prefix = config.prefix;
const myServerID = config.myServerID;
const myServerLogs = config.myServerLogs;
const externalServerLogs = config.externalServerLogs;

module.exports.run = async (client, message) => {
    const serverLogs = client.channels.get(myServerLogs);
    const externalLogs = client.guilds.get(myServerID).channels.get(externalServerLogs);
    
    let botIcon = client.user.displayAvatarURL;
    let commandEmbed = new Discord.RichEmbed()
        .setTitle(`${client.user.name} commands :)`)
        .setDescription(`anyone can do these! use the ${prefix} prefix`)
        .setColor("#7fc0ff")
        .setThumbnail(botIcon)
        .addField("General Commands", "help\ncommands\ngithub\ninvite\ncowjoke\nhello", true)
        .addField("Music Commands", "music functionality hasnt been added yet :(", true)

    message.channel.send(commandEmbed);

    if (message.guild.id == myServerID) {
        return serverLogs.send(`<@${message.member.id}> asked for the commands`);
    } else {
        return externalLogs.send(`<@${message.member.id}> asked for the commands\n**SERVER**: *${message.guild.name}*  || **OWNED BY**: ${message.guild.owner}`);
    }
}

module.exports.help = {
    name: `${prefix}commands`
}