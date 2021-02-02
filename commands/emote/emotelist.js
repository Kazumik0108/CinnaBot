// emotelist.js

///// imports
const { MessageEmbed } = require("discord.js");
const { Command } = require("discord.js-commando");

///// functions
function emoteToTextArray(emotes) {
    // split emote array into line groups of 5 columns
    let array1 = [];
    for (let [column, value] of emotes.entries()) {
        if (column % 5 === 0) {
            array1.push([value]);
        } else {
            array1[array1.length-1].push(value);
        }
    }
    array1 = array1.map(emote => emote.join(""));

    // split emote array further into message groups of 5 rows
    let array2 = [];
    for (let [row, value] of array1.entries()) {
        if (row % 5 === 0) {
            array2.push([value]);
        } else {
            array2[array2.length-1].push(value);
        }
    }
    return array2;
}

function getDate() {
    const today = new Date();
    let year = "" + today.getFullYear();
    let month = "" + today.getMonth();
    let day = "" + today.getDay();
    let hour = "" + today.getHours();
    let min = "" + today.getMinutes();
    let ampm = (hour < 12) ? "AM" : "PM";
    let timezone = "EST"

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    if (hour >= 12) hour = "" + hour % 12;

    return `${year}/${month}/${day} @ ${hour}:${min} ${ampm} ${timezone}`;
}

///// exports
module.exports = class gemInfo extends Command {
    constructor(client) {
        super(client, {
            name: "emotelist",
            group: "emote",
            memberName: "emotelist",
            description: "Sends the list of emotes from a server. The author can only show emotes from servers they share with the bot. Send \"0\" to show the list of emotes in the current server.",
            format: "+emotelist",
            examples: ["+emotelist", "+emotelist 0"],
            guildOnly: true,
            clientPermissions: ["SEND_MESSAGES"],
            userPermissions: ["MANAGE_EMOJIS", "MANAGE_MESSAGES"]
        });
    }

    async run(message) {
        // return early if author is bot
        if (message.author.bot) return;

        // if the user entered "0", send the emotes for the messaged server
        // else ask the users to select from a server they share with the bot
        const args = message.content.split(/ +/);
        if (args[args.length-1] === "0") {
            const guild = message.guild;
            sendGuildEmotes(guild);

        } else {
            // get all servers from client that the author is in
            const cachedGuilds = message.client.guilds.cache;
            const userGuilds = await cachedGuilds.map(async guild => {
                const userGuild = await guild.members.fetch(message.author.id)
                    .then(guildMember => {
                        return guild;
                    })
                    .catch(error => {
                        return null;
                    });
                return userGuild;
            });

            Promise.all(userGuilds).then(Guilds => {
                // remove the servers that the user is not in
                let guilds = Guilds.filter(Guild => Guild !== null);
                
                // sort remaining servers by name, then place the messaged server at front
                guilds = guilds.sort((a, b) => {
                    return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1;
                }).sort((a, b) => {
                    return (a.name === message.guild.name) ? -1 : 1;
                });

                // ask the user to choose the server to display emotes for
                const guildNames = guilds.map((guild, index) => `${index}: ${guild.name}`);
                message.reply(`choose the server number below to display the emotes from. Send \`cancel\` to abort this command.\n\`\`\`\n${guildNames.join("\n")}\n\`\`\``).then(msg => msg.delete({ timeout: 20*1000 }));
                
                const filter = (msg) => (msg.author.id === message.author.id) && (msg.content.toLowerCase() === "end" || (0 <= parseInt(msg.content, 10) && parseInt(msg.content, 10) < guildNames.length));
                const collector = message.channel.createMessageCollector(filter, { timer: 30*1000 });

                collector.on("collect", collect => {
                    // ends the collector when a value index is given or when "end" is given
                    if (collect.content.toLowerCase() === "end") collector.stop();
                    if (guilds[collect.content]) {
                        const guild = guilds[collect.content];
                        sendGuildEmotes(guild);
                        collector.stop();
                    }
                });

                collector.on("end", collected => {
                    // delete all collected messages
                    collected.forEach(msg => msg.delete({ timeout: 2000 }));
                })
            });
        }

        


        ///// functions
        function sendGuildEmotes(guild) {
            // send the list of emotes from the specified guild object
            const emotes = guild.emojis.cache;
                            
            const emoteStatic = emotes.filter(emote => !emote.animated).sort((a, b) => {
                return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1;
            });
            const emoteAnimated = emotes.filter(emote => emote.animated).sort((a, b) => {
                return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1;
            });
        
            const textStatic = emoteToTextArray(emoteStatic.map(emote => (emote.animated) ? `<a:`+emote.name+`:`+emote.id+`>` : `<:`+emote.name+`:`+emote.id+`>`));
            const textAnimated = emoteToTextArray(emoteAnimated.map(emote => (emote.animated) ? `<a:`+emote.name+`:`+emote.id+`>` : `<:`+emote.name+`:`+emote.id+`>`));
        
            // send the emotes into the messaged channel
            const embedMessage = new MessageEmbed()
                .setTitle(`${guild.name} Emote List`)
                .setThumbnail(guild.iconURL())
                .setFooter(`Updated ${getDate()}`)
                .addField(`Static Emotes`, `(${emoteStatic.size}/100)`, true)
                .addField(`Animated Emotes`, `(${emoteAnimated.size}/100)`, true)

            message.say(embedMessage)
                .then(() => message.say(`\*\*Static Emotes\*\*`))
                .then(() => textStatic.forEach(text => message.say(text)))
                .then(() => message.say(`\*\*Animated Emotes\*\*`))
                .then(() => textAnimated.forEach(text => message.say(text)))
        }
    }
};