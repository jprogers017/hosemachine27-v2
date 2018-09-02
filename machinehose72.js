const Discord = require("discord.js");
const fs = require("fs");
const ytdl = require("ytdl-core");
const request = require("request");
const getYouTubeID = require("get-youtube-id");
const fetchVideoInfo = require("youtube-info");
const client = new Discord.Client();

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const commands = JSON.parse(fs.readFileSync('./storage/commands.json', 'utf-8'));

var logContent = "";

client.on('ready', function () {
  console.log(`${client.user.username} is online in ${client.guilds.size} server(s)!`);
  client.user.setActivity(`${config.prefix}help`);
});

client.on('message', async function (message) {
  //variables
  let args = message.content.slice(config.prefix.length).trim().split(/ +/);
  let command = args.shift().toLowerCase();
  const serverLogs = client.channels.get(config.myServerLogs);
  const externalLogs = client.guilds.get(config.myServerID).channels.get(config.externalServerLogs);

  //crashing? not on my watch
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  if (message.channel.type === "dm") {
    message.channel.send("did u want an invite link? <https://discordapp.com/api/oauth2/authorize?client_id=463086178757771264&permissions=0&scope=bot>");
    let dmEmbed = new Discord.RichEmbed()
      .setDescription(`<@${message.author.id}> dm'd me :)\ni sent them my invite link!\n\n<https://discordapp.com/api/oauth2/authorize?client_id=463086178757771264&permissions=0&scope=bot>`)
      .setColor(`#73b6ff`)
      .setThumbnail(message.author.avatarURL)
      .setTimestamp();
    externalLogs.send(dmEmbed)
    return;
  }

  //help command
  if (message.content.toLowerCase().startsWith(`${config.prefix}help`)) {
    if (message.member.nickname) {
      var authorName = message.member.nickname;
    } else {
      var authorName = message.author.username;
    }
    const helpEmbed = new Discord.RichEmbed()
      .setAuthor(`${client.user.username}'s help page! u need help, ${authorName}?`, message.author.avatarURL)
      .setColor(message.member.displayHexColor)
      helpEmbed.setFooter(`(THIS COMMAND BASED HELP SHIT BROKE AF RN IT ALL RETURNS AS "SORRY THIS ISNT A COMMAND" HAHAHA FUCK YOU ITS ALMOST 5 AM EAT MY ENTIRE FUCKING ASS) for command specific help, follow ${config.prefix}help with the command name! for example, ${config.prefix}help hello`)
      .setTimestamp();
    if (message.content.toLowerCase() === `${config.prefix}help`) {
      for (var cmd in commands) {
        if (commands[cmd].type.toLowerCase() === 'member') {
          helpEmbed.addField(`${commands[cmd].name}`, `${commands[cmd].desc}\n*usage: ${commands[cmd].usage}* `);
        }
        helpEmbed.setTitle(`MEMBER COMMANDS || *<required>, [optional]*`)
      }
      return message.channel.send(helpEmbed);
    } else {
      let groupFound = '';
      for (var cmd in commands) {
        if (args.join(/ +/).trim() === commands[cmd].type.toLowerCase()) {
          groupFound = commands[cmd].type.toLowerCase();
          break;
        }
      }
      if (groupFound != '') {
        for (var cmd in commands) {
          if (commands[cmd].type.toLowerCase() === groupFound) {
            helpEmbed.addField(`${commands[cmd].name} `, `${commands[cmd].desc}\n*usage: ${commands[cmd].usage}* `);
          }
        }
        helpEmbed.setTitle(`${groupFound.toUpperCase()} COMMANDS || *<required>, [optional]*`)
        return message.channel.send(helpEmbed);
      } else {
        let commandFound = '';
        for (var cmd in commands) {
          if (args.join(/ +/).trim().toLowerCase === commands[cmd].name.toLowerCase()) {
            if (commandFound === '') {
              helpEmbed.setTitle(`help for: ${commands[cmd].name} || *<required>, [optional]*`)
              helpEmbed.setDescription(`${commands[cmd].desc}\nusage: ${commands[cmd].usage}\nstatus: ${commands[cmd].stage} || required perms: ${commands[cmd].type}`)
              helpEmbed.setFooter(`${config.prefix}help [group or command]`)
              message.channel.send(helpEmbed);
              break;
            }
          }
        }
      }
      message.channel.send({
        embed: {
          description: `No group or command found titled "${args.join(/ +/)}"`,
          color: 0xff0000,
        }
      });
    }

    logContent = `<@${message.member.id}> asked for help!`;
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

  //play
  if (message.content.toLowerCase().startsWith(`${config.prefix}play`)) {
    let validate = await ytdl.validateURL(args[0]);
    let info = await ytdl.getInfo(args[0]);
    let connection = await message.member.voiceChannel.join();
    let dispatcher = await connection.playStream(ytdl(args[0], {
      filter: 'audioonly'
    }));

    if (!message.guild) return;
    else if (!message.member.voiceChannel) return message.channel.send(`uhh..? which channel am i supposed to join? ur not in one`);
    else if (message.guild.me.voiceChannelID !== message.member.voiceChannelID) return message.channel.send(`are u tryna steal me? im already in a voice channel here`);
    else if (!args[0]) return message.channel.send(`what the heckity are u trying to get me to play? put a youtube link or at least something for me to look for, fool`);
    else if (!validate) return message.channel.send(`oi, a valid youtube link, please. thank u`);
    else {
      
      message.channel.send({
        embed: {
          title: "NOW PLAYING:",
          color: 0x73b6ff,
          description: `${info.title}`
        }
      });
    }

    logContent = `<@${message.member.id}> asked the bot to play a youtube video: ${info.title}`;
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

  //leave
  if (message.content.toLowerCase().startsWith(`${config.prefix}leave`)) {
    if (!message.guild) return;
    else if (!message.member.voiceChannel) return message.channel.send(`? but ur not in a voice channel ? lol ?`);
    else if (!message.guild.me.voiceChannel) return message.channel.send(`? but im not in a voice channel ? lol ?`);
    else if (message.guild.me.voiceChannelID !== message.member.voiceChannelID) return message.channel.send(`excuse me honey ur not in here, u dont get to tell me to leave`);
    else {
      message.guild.me.voiceChannel.leave();
      message.channel.send(`bye bye now, see u again hopefully soon :kissing_heart:`)
    }

    logContent = `<@${message.member.id}> asked the bot to leave it's current voice channel`;
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

  //search
  if (message.content.toLowerCase().startsWith(`${config.prefix}search`)) {
    


    message.channel.send({
      embed: {
        title: "This feature is under development.",
        color: 0x73b6ff,
        description: "indicates u would like the current song skipped, and initiates a vote skip (number depending on how many in the channel, 2/3 majority"
      }
    });

    logContent = `<@${message.member.id}> `;
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

  //queue
  if (message.content.toLowerCase().startsWith(`${config.prefix}queue`)) {

    message.channel.send({
      embed: {
        title: "This feature is under development.",
        color: 0x73b6ff,
        description: "indicates u would like the current song skipped, and initiates a vote skip (number depending on how many in the channel, 2/3 majority"
      }
    });

    logContent = `<@${message.member.id}> `;
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

  //skip
  if (message.content.toLowerCase().startsWith(`${config.prefix}skip`)) {

    message.channel.send({
      embed: {
        title: "This feature is under development.",
        color: 0x73b6ff,
        description: "indicates u would like the current song skipped, and initiates a vote skip (number depending on how many in the channel, 2/3 majority"
      }
    });

    logContent = `<@${message.member.id}> `;
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

  //pause
  if (message.content.toLowerCase().startsWith(`${config.prefix}pause`)) {

    message.channel.send({
      embed: {
        title: "This feature is under development.",
        color: 0x73b6ff,
        description: "indicates u would like the current song skipped, and initiates a vote skip (number depending on how many in the channel, 2/3 majority"
      }
    });

    logContent = `<@${message.member.id}> `;
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

  //resume
  if (message.content.toLowerCase().startsWith(`${config.prefix}resume`)) {

    message.channel.send({
      embed: {
        title: "This feature is under development.",
        color: 0x73b6ff,
        description: "indicates u would like the current song skipped, and initiates a vote skip (number depending on how many in the channel, 2/3 majority"
      }
    });

    logContent = `<@${message.member.id}> `;
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

  //now playing
  if (message.content.toLowerCase().startsWith(`${config.prefix}nowplaying`)) {

    message.channel.send({
      embed: {
        title: "This feature is under development.",
        color: 0x73b6ff,
        description: "indicates u would like the current song skipped, and initiates a vote skip (number depending on how many in the channel, 2/3 majority"
      }
    });

    logContent = `<@${message.member.id}> `;
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

  //force skip
  if (message.content.toLowerCase().startsWith(`${config.prefix}fskip`)) {


    logContent = `<@${message.member.id}> `;
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

  //volume 
  if (message.content.toLowerCase().startsWith(`${config.prefix}volume`)) {


    logContent = `<@${message.member.id}> `;
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

  //hello
  if (message.content.toLowerCase().startsWith(`${config.prefix}hello`)) {
    if (message.member.nickname) {
      var authorName = message.member.nickname;
    } else {
      var authorName = message.author.username;
    }
    message.channel.send(`hello, ${authorName}!!!`);

    logContent = `<@${message.member.id}> said hello!!!)`;
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

  //ping
  if (message.content.toLowerCase().startsWith(`${config.prefix}ping`)) {
    var ping = ((new Date().getTime() - message.createdTimestamp) * -1);
    message.channel.send({
      embed: {
        title: "Ping",
        color: 0x73b6ff,
        description: `${ping}ms`
      }
    });

    logContent = `<@${message.member.id}> `;
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
});

client.login(config.discordToken);