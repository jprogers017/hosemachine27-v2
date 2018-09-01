const Discord = require("discord.js");
const fs = require("fs");
const client = new Discord.Client();
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

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

client.on('ready', function () {
  console.log(`${client.user.username} is online in ${client.guilds.size} server(s)!`);
  client.user.setActivity(`${config.prefix}help`);
});

client.on('message', function (message) {
  //variables
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  const serverLogs = client.channels.get(config.myServerLogs);
  const externalLogs = client.guilds.get(config.myServerID).channels.get(config.externalServerLogs);
  let commandFile = client.commands.get(command);
  if (commandFile) commandFile.run(client, message, args);

  //crashing? not on my watch
  if (message.author.bot) return;
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
});

client.login(config.discordToken);