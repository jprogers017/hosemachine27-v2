const Discord = require("discord.js");
const fs = require("fs");
const client = new Discord.Client({
  disableEveryone: true
});
client.commands = new Discord.Collection();

//commands handler
fs.readdir("./commands/", (err, files) => {
  if (err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js")
  if (jsfile.length <= 0) {
    console.log("couldnt find commands");
    return;
  }
  jsfile.forEach((f, i) => {
    let props = require(`./commands/${f}`);
    console.log(`${f} loaded`);
    client.commands.set(props.help.name, props);
  });
});

//variables 
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const prefix = config.prefix;
const discordToken = config.discordToken;
const myServerID = config.myServerID;
const myServerLogs = config.myServerLogs;
const externalServerLogs = config.externalServerLogs;
const joinLeaveChannel = config.joinLeaveChannel;
const generalChat = config.generalChat;

//bot login
client.login(discordToken);

//on message in console and activity
client.on('ready', function () {
  console.log(`${client.user.username} is online in ${client.guilds.size} server(s)!`);
  client.user.setActivity(`type ${prefix}cowjoke, i dare u`);
});

//member joins
client.on('guildMemberAdd', member => {
  if (member.guild.id == myServerID) {
    // member.guild.channels.get(joinLeaveChannel).send(`<@${member.user.id}> just joined the server!!! hello!!!!!`).catch(err => console.log(err));
    // member.guild.channels.get(generalChat).send(`<@${member.user.id}> just joined the server!!! hello!!!!!`).catch(err => console.log(err));
  } else {
    return;
  }
});

//member leaves
client.on('guildMemberRemove', member => {
  if (member.guild.id == myServerID) {
    // member.guild.channels.get(joinLeaveChannel).send(`<@${member.user.id}> just left, :(`).catch(err => console.log(err));
    // member.guild.channels.get(generalChat).send(`<@${member.user.id}> just left, :(`).catch(err => console.log(err));
  } else {
    return;
  }
});

client.on('message', function (message) {
  //variables
  const mess = message.content.toLowerCase();
  let messageArray = message.content.split(" ");
  let args = messageArray.slice(1);
  const serverLogs = client.channels.get(myServerLogs);
  const externalLogs = client.guilds.get(myServerID).channels.get(externalServerLogs);
  let cmd = messageArray[0];
  let commandFile = client.commands.get(cmd);
  if (commandFile) commandFile.run(client, message, args);

  //crashing? not on my watch
  if (message.author.bot) return;
  if (message.channel.type === "dm") {
    externalLogs.send(`someone slid into my dm's :eyes: :eyes: :eyes:\ni gave them an invite link :)`)
    message.channel.send("did u want an invite link? <https://discordapp.com/api/oauth2/authorize?client_id=463086178757771264&permissions=0&scope=bot>");
    return;
  }
});