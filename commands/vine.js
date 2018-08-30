const Discord = require("discord.js");
const fs = require("fs");
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const prefix = config.prefix;
const myServerID = config.myServerID;
const myServerLogs = config.myServerLogs;
const externalServerLogs = config.externalServerLogs;

module.exports.run = async (client, message, args) => {
    const serverLogs = client.channels.get(myServerLogs);
    const externalLogs = client.guilds.get(myServerID).channels.get(externalServerLogs);
    const logContent = `<@${message.member.id}> asked for a vine`;

    //https://www.youtube.com/playlist?list=PLCRi2kg6z92FPyTu4ut49faqAYPS5eBsA
    var vine = [
        "https://youtu.be/y7LY46fyRVQ",
        "https://youtu.be/bFw5lrN-mig",
        "https://youtu.be/qUEy55r49fY",
        "https://youtu.be/XzR3pX31Hoo",
        "https://youtu.be/q7ekk47uLdM",
        "https://youtu.be/bTv2upWCLY8",
        "https://youtu.be/t67bRKIy9ZY",
        "https://youtu.be/rZuFj9dSaBQ",
        "https://youtu.be/Hs0AO0K2xcM",
        "https://youtu.be/iE7pkQSQglg",
        "https://youtu.be/iE7pkQSQglg",
        "https://youtu.be/iE7pkQSQglg",
        "https://youtu.be/ydk_pc-jx1c",
        "https://youtu.be/4xc9MHo4FCw",
        "https://youtu.be/jKD05qgHthk",
        "https://youtu.be/jKD05qgHthk",
        "https://youtu.be/TAZYqXwW5lA",
        "https://youtu.be/BiR5P48JeKU",
        "https://youtu.be/mBitRAiRPIA",
        "https://youtu.be/mBitRAiRPIA",
        "https://youtu.be/pFSXx3BerNQ",
        "https://youtu.be/8aCgeKfhS54",
        "https://youtu.be/8Iqac1RyBME",
        "https://youtu.be/jLloLp3zLDw",
        "https://youtu.be/NYCQn2udzmY",
        "https://youtu.be/UGTNAnQFpUE",
        "https://youtu.be/YcBfDQIJHiI",
        "https://youtu.be/qEEI2tFvKSI",
        "https://youtu.be/KbL-A8JdJvg",
        "https://youtu.be/KbL-A8JdJvg",
        "https://youtu.be/zufgsUEeHmc",
        "https://youtu.be/1nz8aZ67Prw",
        "https://youtu.be/1nz8aZ67Prw",
        "https://youtu.be/94LHw8fa_GE",
        "https://youtu.be/V2uUJSY7_jc",
        "https://youtu.be/ToLk-BwNCfM",
        "https://youtu.be/eQcf4n8E_uU",
        "https://youtu.be/Xyx3Gw6EBq8",
        "https://youtu.be/lSLSjqgzfwo",
        "https://youtu.be/jONn-spGhx8",
        "https://youtu.be/odFZbufP8p0",
        "https://youtu.be/zeeuZMW3P1A",
        "https://youtu.be/ZrXprytCMZk",
        "https://youtu.be/URlHFuka7jo",
        "https://youtu.be/ucLf27LfIZg",
        "https://youtu.be/QE9EVvM1Vns",
        "https://youtu.be/BOa4JCBQTY8",
        "https://youtu.be/ijAJne2BQ8c",
        "https://youtu.be/d__pJojzG-g",
        "https://youtu.be/8l0sxAGJZ9w",
        "https://youtu.be/aUfxqxMnHjA",
        "https://youtu.be/ukXkAz7MBdk",
        "https://youtu.be/ukXkAz7MBdk",
        "https://youtu.be/06367LPJGfA",
        "https://youtu.be/GctcztImvNo",
        "https://youtu.be/856Gq5YMMF4",
        "https://youtu.be/jfviUbgGimw",
        "https://youtu.be/t3onBxGCy0c",
        "https://youtu.be/MLwVinRJg-I",
        "https://youtu.be/EuE3P4vyvD4",
        "https://youtu.be/YfFko5qhZtY",
        "https://youtu.be/YfFko5qhZtY",
        "https://youtu.be/HJAkUk-9RfE",
        "https://youtu.be/45rJbXjfnSE",
        "https://youtu.be/NOPIobI_0B8",
        "https://youtu.be/6-9PbCok1sU",
        "https://youtu.be/laLgR0mLL1A",
        "https://youtu.be/laLgR0mLL1A",
        "https://youtu.be/b21NdQg7zL4",
        "https://youtu.be/GZyQkido454",
        "https://youtu.be/Eywp61pXUm4",
        "https://youtu.be/D8j_f9eDlbA",
        "https://youtu.be/rMzRwwo1PZg",
        "https://youtu.be/ChLf-ed7tX8",
        "https://youtu.be/ChLf-ed7tX8",
        "https://youtu.be/oXU-7czQWAU",
        "https://youtu.be/q4F2Qv5Ddcw",
        "https://youtu.be/kI65vqwg-lM",
        "https://youtu.be/q4F2Qv5Ddcw",
        "https://youtu.be/XUjTmTnnszk",
        "https://youtu.be/aF1qQxPhybE",
        "https://youtu.be/s8zO0xVgdkk",
        "https://youtu.be/3HldLkTST94",
        "https://youtu.be/rNEINbvGEro",
        "https://youtu.be/X7WxTi3uaiE",
        "https://youtu.be/3FnvRYszrWQ",
        "https://youtu.be/WtE4GlfrPfc",
        "https://youtu.be/rfjUYWq9SAY",
        "https://youtu.be/GaNGKD4MTV0",
        "https://youtu.be/vhCypQDusYI",
        "https://youtu.be/vqE6I181COA",
        "https://youtu.be/zTJm_7yJn3c",
        "https://youtu.be/KeFeGms9Jls",
        "https://youtu.be/UBQP9gEldRk",
        "https://youtu.be/uWz-PY8qXZw",
        "https://youtu.be/8fzEJRxDKiU",
        "https://youtu.be/dNavpxx_PPk",
        "https://youtu.be/R5J7znTWijg",
        "https://youtu.be/KoKPT_cnyXs",
        "https://youtu.be/IM1uBvNvUuE",
        "https://youtu.be/7UuK9w3DYK4",
        "https://youtu.be/c9H7wwfrpgI",
        "https://youtu.be/4zLpv_3z7gc",
        "https://youtu.be/4zLpv_3z7gc",
        "https://youtu.be/kU-u6151Ugo",
        "https://youtu.be/7eSSE-dd2yY",
        "https://youtu.be/Tlwda9S58Lg",
        "https://youtu.be/HjM_2ojJBoM",
        "https://youtu.be/7f3DHfYNqwc",
        "https://youtu.be/Pk8ueJmLvBE",
        "https://youtu.be/FQQ1kIbKnms",
        "https://youtu.be/1RgAyZyKZZI",
        "https://youtu.be/CIezqiRltTo",
        "https://youtu.be/r4tOIFPwyUo",
        "https://youtu.be/Isrd9-h1Kbg",
        "https://youtu.be/hcehzlBd_uY",
        "https://youtu.be/_zZC_CE6jx8",
        "https://youtu.be/-4UMUjBvIec",
        "https://youtu.be/jNgUgKltj-Y",
        "https://youtu.be/r9Iwph3aU2U",
        "https://youtu.be/609YTBQzQyY",
        "https://youtu.be/OyBmEeojfKo",
        "https://youtu.be/xjst9kmTv-4",
        "https://youtu.be/n7TF0vSY6Ww",
        "https://youtu.be/blpe_sGnnP4",
        "https://youtu.be/meAT7-82e_g",
        "https://youtu.be/Vfys5p4D04U",
        "https://youtu.be/s5BSAIUSUc4",
        "https://youtu.be/d6gBu2Zd7Bc",
        "https://youtu.be/eTonc3Ql8AM",
        "https://youtu.be/EHJusUTrPg8",
        "https://youtu.be/WYEcKNyW4iA",
        "https://youtu.be/6hQ49ver8Ew",
        "https://youtu.be/rePPQFm9fzY",
        "https://youtu.be/7merzCPl-Xg",
        "https://youtu.be/X7cQ7KnoRk0",
        "https://youtu.be/1eQZLd6AABE",
        "https://youtu.be/ZlYlPX2KhyE",
        "https://youtu.be/7DCz1SgByDM",
        "https://youtu.be/cMzddpU904U",
        "https://youtu.be/Wo9p4Lqaakg",
        "https://youtu.be/o0taTX4egz4",
        "https://youtu.be/tA8LjcpjjKQ",
        "https://youtu.be/rDr7du3NbEI",
        "https://youtu.be/zEFoyDYu-ck",
        "https://youtu.be/XkCDwL7kOgo",
        "https://youtu.be/zsUBRCdEDYY",
        "https://youtu.be/U8HDMK963dM",
        "https://youtu.be/ekl_arkB4MU",
        "https://youtu.be/2bnnDTPCA94",
        "https://youtu.be/CIZePAoYE9w",
        "https://youtu.be/4TJZps0OZWI",
        "https://youtu.be/kwcT815Iwik",
        "https://youtu.be/6nC_d-dqFZc",
        "https://youtu.be/OrOEHFa_408",
        "https://youtu.be/MTIK8lKji_M",
        "https://youtu.be/5sIN0dwVhKA",
        "https://youtu.be/64ucqo3g7Q8",
        "https://youtu.be/LzS7FZTt1Pg",
        "https://youtu.be/Rbi4PZBQaiM",
        "https://youtu.be/t0IYw7ApKo0",
        "https://youtu.be/8U0sjHxYqrw",
        "https://youtu.be/rbZSi2Ju1_Q",
        "https://youtu.be/QCG8EbEO9DI",
        "https://youtu.be/c38_1E_esPc",
        "https://youtu.be/b1FinfVUp38",
        "https://youtu.be/9rg1GCeIYG8",
        "https://youtu.be/nKGWzCZJiuA",
        "https://youtu.be/DvT1v8WFkmI",
        "https://youtu.be/UwVVZPzo8iM",
        "https://youtu.be/XnVV65fck1g",
        "https://youtu.be/FEkUWMq4HyI",
        "https://youtu.be/QWbQ-h3_6tI",
        "https://youtu.be/opljrfGx7aU",
        "https://youtu.be/8BQcCI7rmIU",
        "https://youtu.be/1w-o9KMJYzY",
        "https://youtu.be/Ka89vyLH_aI",
        "https://youtu.be/SrkX9WYmBdU",
        "https://youtu.be/BEjwxz1OZsg" //198,
    ];

    var rand = vine[Math.floor(Math.random() * vine.length)];
    message.channel.send(rand);

    if (message.guild.id == myServerID) {
        let logsEmbed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setDescription(logContent)
            .addField('channel:', message.channel.name)
            .setColor(message.member.displayHexColor)
            .setThumbnail(message.author.avatarURL)
            .setTimestamp();

        serverLogs.send(logsEmbed);
    } else {
        let logsEmbed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setDescription(logContent)
            .addField('server (owner):', `${message.guild.name} (${message.guild.owner})`, true)
            .addField('channel:', message.channel.name, true)
            .setColor(message.member.displayHexColor)
            .setThumbnail(message.author.avatarURL)
            .setTimestamp();

        externalLogs.send(logsEmbed);
    }
}

module.exports.help = {
    name: `${prefix}vine`,
    description: `sends a random, top notch, high quality, vine...more will be added soon`,
    type: `member`,
    usage: `${prefix}vine`
}