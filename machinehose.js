const Discord = require("discord.js");
const fs = require("fs");
const ytdl = require("ytdl-core");
const request = require("request");
const getYouTubeID = require("get-youtube-id");
const fetchVideoInfo = require("youtube-info");
const timeFormat = require('hh-mm-ss');
const numFormatter = require('@amandeepmittal/number-formatter');
const client = new Discord.Client();

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const commands = JSON.parse(fs.readFileSync('./storage/commands.json', 'utf-8'));

const defaultPrefix = ":)";
const yt_api_key = config.yt_api_key;
var logContent = "";
var guilds = {};
var timer = 0;

client.on('ready', function () {
  console.log(`${client.user.username} is online in ${client.guilds.size} server(s)!`);
  setInterval(setStatus, 8500);
});

client.on('message', function (message) {
  //server prefixes
  let prefixes = JSON.parse(fs.readFileSync("./storage/prefixes.json", "utf-8"));
  if (!prefixes[message.guild.id]) {
    prefixes[message.guild.id] = {
      prefixes: config.prefix
    };
  }

  //variables
  let prefix = prefixes[message.guild.id].prefixes;
  let args = message.content.slice(prefix.length).trim().split(/ +/);
  let command = args.shift().toLowerCase();
  const serverLogs = client.channels.get(config.myServerLogs);
  const externalLogs = client.guilds.get(config.myServerID).channels.get(config.externalServerLogs);

  //crashing? not on my watch
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
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

  if (!guilds[message.guild.id]) {
    guilds[message.guild.id] = {
      queue: [],
      queueNames: [],
      isPlaying: false,
      dispatcher: null,
      voiceChannel: null,
      volume: 5,
      skipReq: 0,
      skippers: []
    };
  }

  //play + leave
  if (message.content.toLowerCase().startsWith(`${prefix}play`)) {
    if (!message.guild) return;
    else if (message.member.voiceChannel || guilds[message.guild.id].voiceChannel != null) {
      if (guilds[message.guild.id].queue.length > 0 || guilds[message.guild.id].isPlaying) {
        getID(args, function (id) {
          add_to_queue(id, message);
          fetchVideoInfo(id, function (err, videoInfo) {
            if (err) throw new Error(err);
            message.channel.send({
              embed: {
                title: "ADDED TO QUEUE:",
                color: 0x73b6ff,
                description: `[${videoInfo.title}](${videoInfo.url})`
              }
            });
            guilds[message.guild.id].queueNames.push(videoInfo.title);
          });
        });
      } else if (args[0] === undefined) {
        message.channel.send(`im not sure what u want me to play? try adding a youtube link after or even something u would like to search for on youtube!`)
      } else {
        isPlaying = true;
        getID(args, function (id) {
          guilds[message.guild.id].queue.push(id);
          playMusic(id, message);
          fetchVideoInfo(id, function (err, videoInfo) {
            if (err) throw new Error(err);
            guilds[message.guild.id].queueNames.push(videoInfo.title);
            message.channel.send({
              embed: {
                title: "NOW PLAYING:",
                color: 0x73b6ff,
                description: `[${videoInfo.title}](${videoInfo.url})`
              }
            });
          });
        });
      }
    } else {
      message.channel.send(`uhh..? which channel am i supposed to join? ur not in one`);
    }
    logContent = `<@${message.member.id}> asked the bot to play a song ${ytdl.getInfo.title}`;
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
  } else if (message.content.toLowerCase().startsWith(`${prefix}leave`)) {
    if (!message.guild) return;
    else if (!message.member.voiceChannel) return message.channel.send(`? but ur not in a voice channel ? lol ?`);
    else if (!message.guild.me.voiceChannel) return message.channel.send(`? but im not in a voice channel ? lol ?`);
    else if (message.guild.me.voiceChannelID !== message.member.voiceChannelID) return message.channel.send(`excuse me honey ur not in here, u dont get to tell me to leave`);
    else {
      guilds[message.guild.id].queue = [];
      guilds[message.guild.id].queueNames = [];
      guilds[message.guild.id].isPlaying = false;
      message.guild.me.voiceChannel.leave();
      message.channel.send(`bye bye now, see u again soon hopefully :kissing_heart:`)
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

  //view queue + current song playing
  if (message.content.toLowerCase().startsWith(`${prefix}queue`)) {
    if (!message.guild) return;
    else if (guilds[message.guild.id].queue.length === 0) {
      message.channel.send(`the queue is currently empty, do **${prefix}play <song>** to add something!`);
    } else {
      let queueEmbed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username}'s current song queue!`, client.user.avatarURL)
        .setDescription(`to add more songs to the queue type "${prefix}play <song>" in chat`)
        .setColor('#73b6ff')
        .setTimestamp();
      var temp = "";
      for (var i = 0; i < guilds[message.guild.id].queueNames.length; i++) {
        queueEmbed.addField(`${temp = (i + 1)}: ${guilds[message.guild.id].queueNames[i]}`, `(will fix later, im tired) [click here to go to the video on youtube!](${fetchVideoInfo.url})`)
      }
      message.channel.send(queueEmbed);
    }

    logContent = `<@${message.member.id}> asked to view the current song queue`;
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
  } else if (message.content.toLowerCase().startsWith(`${prefix}np`)) {
    if (!message.guild) return;
    else if (guilds[message.guild.id].queue.length > 0 || guilds[message.guild.id].isPlaying) {
      getID(args, function (id) {
        fetchVideoInfo(id, function (err, videoInfo) {
          if (err) throw new Error(err);
          var songDuration = timeFormat.fromS(videoInfo.duration, 'hh:mm:ss');
          var formatViews = numFormatter(videoInfo.views);
          let npEmbed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor(`#73b6ff`)
            .setTitle(`NOW PLAYING: ${guilds[message.guild.id].queueNames}`)
            .setDescription(`<${videoInfo.url}>\n${formatViews} views, ${songDuration}`)
            .setImage(videoInfo.thumbnailUrl)
            .setTimestamp();
          message.channel.send(npEmbed);
        });
      });
    }
    logContent = `<@${message.member.id}> asked to view the current song playing`;
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

  //skip + force skip
  if (message.content.toLowerCase().startsWith(`${prefix}skip`)) {
    if (!message.guild) return;
    else if (guilds[message.guild.id].queue.length === 0) {
      message.channel.send(`nothing to skip tho, wyd`);
    } else if (guilds[message.guild.id].queue.length === 1) {
      guilds[message.guild.id].queue = [];
      guilds[message.guild.id].queueNames = [];
      guilds[message.guild.id].isPlaying = false;
      message.guild.me.voiceChannel.leave();
      message.channel.send(`this is the last thing in the queue, gonna leave now xoxoxo`);
    } else {
      if (guilds[message.guild.id].skippers.indexOf(message.author.id) === -1) {
        guilds[message.guild.id].skippers.push(message.author.id);
        guilds[message.guild.id].skipReq++;
        if (guilds[message.guild.id].skipReq >= Math.ceil((guilds[message.guild.id].voiceChannel.members.size - 1) / 2)) {
          skip_song(message);
          message.channel.send(`aw not enough people like the current song, guess ill skip it :(`)
        } else {
          message.channel.send(`u dont like the current song? fine, u need ${Math.ceil((guilds[message.guild.id].voiceChannel.members.size - 1) / 2) - guilds[message.guild.id].skipReq} more votes to skip`);
        }
      } else {
        message.channel.send(`hello? u already voted to skip wyd`);
      }
    }

    logContent = `<@${message.member.id}> requested to skip the current song`;
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
  } else if (message.content.toLowerCase().startsWith(`${prefix}fskip`)) {
    if (!message.guild) return;
    else if (guilds[message.guild.id].queue.length === 0) {
      message.channel.send(`nothing to skip tho, wyd`);
    } else if (!message.member.hasPermission("ADMINISTRATOR")) {
      message.channel.send(`u dont have perms to do that :/// sorry`);
    } else if (guilds[message.guild.id].queue.length === 1) {
      guilds[message.guild.id].queue = [];
      guilds[message.guild.id].queueNames = [];
      guilds[message.guild.id].isPlaying = false;
      message.guild.me.voiceChannel.leave();
      message.channel.send(`this is the last thing in the queue, gonna leave now xoxoxo`);
    } else {
      skip_song(message);
      message.channel.send(`YEET, song go bye bye`);
    }

    logContent = `<@${message.member.id}> forced skipped the current song)`;
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

  //pause + resume
  if (message.content.toLowerCase().startsWith(`${prefix}pause`)) {
    if (!message.guild) return;
    else if (!message.member.hasPermission("ADMINISTRATOR")) {
      message.channel.send(`u dont have perms to do that :/// sorry`);
    } else if (guilds[message.guild.id] && guilds[message.guild.id].isPlaying) {
      message.channel.send(`theres nothing playing tho`);
    } else {
      guilds[message.guild.id].isPlaying = false;
      guilds[message.guild.id].dispatcher.pause();
      return message.channel.send(`i paused it for u !!!`);
    }

    logContent = `<@${message.member.id}> paused the current song`;
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
  } else if (message.content.toLowerCase().startsWith(`${prefix}resume`)) {
    if (!message.guild) return;
    else if (!message.member.hasPermission("ADMINISTRATOR")) {
      message.channel.send(`u dont have perms to do that :/// sorry`);
    } else if (guilds[message.guild.id] && !guilds[message.guild.id].isPlaying) {
      guilds[message.guild.id].isPlaying = true;
      guilds[message.guild.id].dispatcher.resume();
      return message.channel.send(`im BRINGING BACK THE MUSIC YALL`);
    } else {
      message.channel.send(`theres nothing playing tho`);
    }

    logContent = `<@${message.member.id}> resumed the current song`;
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
  if (message.content.toLowerCase().startsWith(`${prefix}hello`)) {
    if (!message.guild) return;
    else {
      if (message.member.nickname) {
        var authorName = message.member.nickname;
      } else {
        var authorName = message.author.username;
      }
      message.channel.send(`hello, ${authorName}!!!`);
    }

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
  if (message.content.toLowerCase().startsWith(`${prefix}ping`)) {
    if (!message.guild) return;
    else {
      var ping = ((new Date().getTime() - message.createdTimestamp) * -1);
      message.channel.send({
        embed: {
          title: "Ping",
          color: 0x73b6ff,
          description: `${ping}ms`
        }
      });
    }

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
  
  //cow jokes
  if (message.content.toLowerCase().startsWith(`${prefix}cowjoke`)) {
    if (!message.guild) return;
    var cowJokes = [
      "WHY DO COWS HAVE HOOVES INSTEAD OF FEET? BECAUSE THEY LACTOSE",
      "WHAT DO YOU CALL A HERD OF COWS JACKING OFF? BEEF STROKIN OFF",
      "WHAT DO YOU CALL A COW WITH TWO LEGS? YOUR MOM, **LMAO**",
      "WHY DO COWS HAVE HOOVES INSTEAD OF FEET? BECAUSE THEY LACTOSE",
      "WHAT DO YOU CALL A HERD OF COWS JACKING OFF? BEEF STROKIN OFF",
      "WHAT DO YOU CALL A COW WITH TWO LEGS? YOUR MOM, **LMAO**",
      "WHY DO COWS HAVE HOOVES INSTEAD OF FEET? BECAUSE THEY LACTOSE",
      "WHAT DO YOU CALL A HERD OF COWS JACKING OFF? BEEF STROKIN OFF",
      "WHAT DO YOU CALL A COW WITH TWO LEGS? YOUR MOM, **LMAO**",
      "WHY DO COWS HAVE HOOVES INSTEAD OF FEET? BECAUSE THEY LACTOSE",
      "WHAT DO YOU CALL A HERD OF COWS JACKING OFF? BEEF STROKIN OFF",
      "WHAT DO YOU CALL A COW WITH TWO LEGS? YOUR MOM, **LMAO**",
      "WHY DO COWS HAVE HOOVES INSTEAD OF FEET? BECAUSE THEY LACTOSE",
      "WHAT DO YOU CALL A HERD OF COWS JACKING OFF? BEEF STROKIN OFF",
      "WHAT DO YOU CALL A COW WITH TWO LEGS? YOUR MOM, **LMAO**",
      "WHY DO COWS HAVE HOOVES INSTEAD OF FEET? BECAUSE THEY LACTOSE",
      "WHAT DO YOU CALL A HERD OF COWS JACKING OFF? BEEF STROKIN OFF",
      "WHAT DO YOU CALL A COW WITH TWO LEGS? YOUR MOM, **LMAO**",
      "WHY DO COWS HAVE HOOVES INSTEAD OF FEET? BECAUSE THEY LACTOSE",
      "WHAT DO YOU CALL A HERD OF COWS JACKING OFF? BEEF STROKIN OFF",
      "WHAT DO YOU CALL A COW WITH TWO LEGS? YOUR MOM, **LMAO**",
      "WHAT DO YOU CALL A REALLY STRONG COW? BEEFY",
      "WHAT DO YOU CALL A COW WITH NO LEGS? GROUND BEEF",
      "WHAT DO YOU CALL A COW WITH THREE LEGS? LEAN BEEF",
      "WHY DONT COWS HAVE ANY MONEY? CBECAUSE FARMERS MILK THEM DRY",
      "WHAT DID THE MAMA COW SAY TO THE BABY COW? ITS PASTURE BEDTIME",
      "WHAT DO YOU GET WHEN YOU CROSS AN ANGRY SHEEP WITH AN UPSET COW? AN ANIMAL THATS IN A BAAAAAAAAD MOOOOOOOOOD",
      "DO YOU KNOW WHY THE COW JUMPED OVER THE MOON? THE FARMER HAD COLD HANDS",
      "WHY DID THE COW CROSS THE ROAD? TO GET TO THE UDDER SIDE",
      "WHAT DO YOU CALL A COW YOU CANT SEE? CAMOOFLAUGED",
      "HOW EASY IS IT TO MILK A COW? ITS A PIECE OF STEAK",
      "WHY DOES A MILKING STOOL ONLY HAVE THREE LEGS? BECAUSE THE COW HAS THE UDDER",
      "HOW DO YOU MAKE A MILKSHAKE? YOU GIVE A COW A POGO STICK",
      "WHAT DID THE COW SAY TO THE COW TIPPERS? DONT MOOOOOVE A MUSCLE",
      "WHERE DO COWS GO FOR LUNCH? THE CALF-ETERIA",
      "WHAT DO YOU CALL A COW THAT WORKS FOR A GARDENER? A LAWN MOO-ER",
      "WHICH JOB IS A COW MOST SUITED FOR? A BAKER. THEYRE ALWAYS MAKING COW PIES",
      "WHAT DO YOU CALL A COW WITH AN ASSISTANT? MOOOOOOOVING UP IN THE WORLD",
      "WHERE DID THE COWS GO LAST NIGHT? TO THE MOOOOOOON",
      "WHY CANT A COW BECOME A DETECTIVE? BECAUSE THEY REFUSE TO GO ON STEAKOUTS",
      "HOW DOES A COW GET TO THE MOOOON? IT FLIES THROUGH UDDER SPACE",
      "WHAT HAPPENS WHEN YOU TALK TO A COW? IT GOES IN ONE EAR AND OUT THE UDDER",
      "WHAT DO YOU CALL CATTLE WITH A SENSE OF HUMOR? LAUGHING STOCK",
      "WHATS A COWS FAVORITE COLOR? MAROOOOOOOON",
      "WHY DID THE BLONDE BUY A BROWN COW? TO GET CHOCOLATE MILK",
      "WHAT DO YOU CALL A SLEEPING COW? A BULLDOZER",
      "WHAT DO YOU GET WHEN YOU CROSS AN ELEPHANT WITH A DAIRY COW? PEANUT BUTTER",
      "HOW DOES LADY GAGA LIKE HER STEAK? RAW RAW RAW RAW RAW",
      "WHAT ARE A COWS FAVORITE SUBJECTS IN SCHOOL? MOOSIC PSYCOWLOGY, AND COWCULUS",
      "WHAT DO YOU GET WHEN YOU CROSS A COW AND A DUCK? MILK AND QUACKERS",
      "WHAT DO YOU CALL IT WHEN A COW JUMPS OVER A BARBED WIRE FENCE? AN UDDER-CATASTROPHE",
      "WHERE DO YOU FIND THE MOST COWS? MOO-YORK",
      "WHAT DO COWS GET WHEN THEYRE SICK? HAY FEVER",
      "WHAT DO YOU CALL A SAD COW? MOOOOVED TO TEARS",
      "DID YOU HEAR THAT CHUCK NORRIS IS A MATADOR? HE TAKES THE BULL BY THE HORNS",
      "WHERE DID THE BULL LOSE ALL HIS MONEY? AT THE COWSINO",
      "WHAT DID THE COW SAY TO THE OUSY RENTER? MOOOOOOOOOOOOOVE YOURSELF OUT OF HERE",
      "HOW CAN YOU TELL WHICH COW IS THE BEST DANCER? WAIT TILL HE BUSTS A MOOOOOOVE",
      "DID YOU HEAR ABOUT THE BLONDE THAT DIED WITHA  BOW AND ARROW IN HER HAND? SHE HIT THE BULLS EYE",
      "WHY DO COWS WEAR BELLS? THEIR HORNS DONT WORK",
      "WHAT KIND OF MILK COMES FROM A FORGETFUL COW? MILK OF AMNESIA",
      "WHAT IS A COWS FAVORITE TYPE OF MATH? MOO-TIPLICATION",
      "WHERE DO COWS GO WHEN THEY WANT A NIGHT OUT? TO THE MOOOVIES",
      "WHAT DO YOU CALL A COW WITH A TWITCH? BEEF JERKY",
      "WHAT WERE THE COWS DOING UNDER THE TREE? TALKING ABOUT THE LATEST MOOS",
      "WHAT WAS THE BULL DOING IN THE PASTURE WITH HIS EYES CLOSED? BULL-DOZING",
      "HOW DOES THE FARMER COUNT A HERD OF COWS? WITH A COWCULATOR",
      "WHERE DO THE RUSSIANS GET THEIR MILK? FROM MOS-COW",
      "WHATS A COWS FAVORITE MOOSICAL NOTE? BEEF-FLAT",
      "WHAT DO YOU CALL A COW THATS AFRAID OF THE DARK? A COWARD"
    ];

    var rand = cowJokes[Math.floor(Math.random() * cowJokes.length)];
    message.channel.send(rand).catch(error => {
      console.log(error);
    });

    logContent = `<@${message.member.id}> asked for a cow joke :)`;
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
  if (message.content.toLowerCase().startsWith(`${prefix}volume`)) {
    if (!message.guild) return;
    else if (guilds[message.guild.id].queue.length === 0) return message.channel.send(`theres nothing playing tho`);
    else if (!args[0]) return message.channel.send(`the current volume level is ${guilds[message.guild.id].volume}`);
    else if (!message.member.hasPermission("ADMINISTRATOR")) {
      message.channel.send(`u dont have perms to do that :/// sorry`);
    } else {
      guilds[message.guild.id].volume = args[0];
      guilds[message.guild.id].dispatcher.setVolumeLogarithmic(args[0] / 5);
      return message.channel.send(`volume for this song has been set to ${args[0]}`);
    }

    logContent = `<@${message.member.id}> changed the volume to ${args[0]} for the current song)`;
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

  //custom server prefixes
  if (message.content.toLowerCase().startsWith(`${prefix}prefix`)) {
    if (!message.guild) return;
    else if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(`u need to be an admin to change my prefix`);
    else if (!args[0]) return message.channel.send(`the server's current prefix is ${prefix}`);
    else if (args[0] == "?") {
      return message.channel.send(`Usage: ${prefix}prefix <new prefix>`);
    } else {
      prefixes[message.guild.id] = {
        prefixes: args[0]
      };
      fs.writeFile("./prefixes.json", JSON.stringify(prefixes), (err) => {
        if (err) console.log(err);
      });
      message.channel.send({
        embed: {
          description: `this server's prefix has been set to ${args[0]}`,
          color: 0x71bcff
        }
      });
    }

    logContent = `<@${message.member.id}> set the server's prefix to ${args[0]})`;
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

  //help command
  if (message.content.toLowerCase().startsWith(`${prefix}help`)) {
    if (!message.guild) return;
    else {
      if (message.member.nickname) {
        var authorName = message.member.nickname;
      } else {
        var authorName = message.author.username;
      }
      const helpEmbed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username}'s help page! u need help, ${authorName}?`, message.author.avatarURL)
        .setColor(message.member.displayHexColor)
      helpEmbed.setFooter(`BROKEN -> for command specific help, follow ${prefix}help with the command name! for example, ${prefix}help hello`)
        .setTimestamp();
      if (message.content.toLowerCase() === `${prefix}help`) {
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
                helpEmbed.setFooter(`${prefix}help [group or command]`)
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
});

client.login(config.discordToken);

function skip_song(message) {
  guilds[message.guild.id].dispatcher.end();
}

function playMusic(id, message) {
  guilds[message.guild.id].voiceChannel = message.member.voiceChannel;
  guilds[message.guild.id].voiceChannel.join().then(function (connection) {
    stream = ytdl("https://www.youtube.com/watch?v=" + id, {
      filter: 'audioonly'
    });
    guilds[message.guild.id].skipReq = 0;
    guilds[message.guild.id].skippers = [];

    guilds[message.guild.id].dispatcher = connection.playStream(stream);
    guilds[message.guild.id].dispatcher.on('end', function () {
      guilds[message.guild.id].skipReq = 0;
      guilds[message.guild.id].skippers = [];
      guilds[message.guild.id].queue.shift();
      guilds[message.guild.id].queueNames.shift();
      if (guilds[message.guild.id].queue.length === 0) {
        guilds[message.guild.id].queue = [];
        guilds[message.guild.id].queueNames = [];
        guilds[message.guild.id].isPlaying = false;
      } else {
        setTimeout(function () {
          playMusic(guilds[message.guild.id].queue[0], message);
        }, 500);
      }
    });
  });
}

function getID(str, cb) {
  if (isYoutube(str)) {
    cb(getYouTubeID(str));
  } else {
    search_video(str, function (id) {
      cb(id);
    });
  }
}

function add_to_queue(strID, message) {
  if (isYoutube(strID)) {
    guilds[message.guild.id].queue.push(getYouTubeID(strID));
  } else {
    guilds[message.guild.id].queue.push(strID);
  }
}

function search_video(query, callback) {
  request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + yt_api_key, function (error, response, body) {
    var json = JSON.parse(body);
    if (!json.items[0]) callback("3_-a9nVZYjk");
    else {
      callback(json.items[0].id.videoId);
    }
  });
}

function isYoutube(str) {
  return str.indexOf("youtube.com") > -1;
}

function setStatus() {
  if (timer === 0) {
    client.user.setActivity(`my default prefix is ${defaultPrefix}`, {
      type: 'PLAYING'
    });
    timer = 1;
    return;
  } else if (timer === 1) {
    client.user.setActivity(`music on youtube`, {
      type: 'LISTENING'
    });
    timer = 2;
    return;
  } else {
    client.user.setActivity(`try ${defaultPrefix}cowjoke, i dare u`, {
      type: 'PLAYING'
    });
    timer = 0;
    return;
  }
}