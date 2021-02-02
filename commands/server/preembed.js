// preembed.js

///// imports
const { MessageEmbed } = require("discord.js");
const { Command } = require("discord.js-commando");
const embedMessages  = require("../../embed/reception.json");

module.exports = class preembed extends Command {
    constructor(client) {
        super(client, {
            name: "preembed",
            group: "server",
            memberName: "preembed",
            description: "Send a pre-formatted embed message to the channel",
            guildOnly: true,
            args: [
                {
                    key: "name",
                    prompt: "Enter the embedded message name to display. Send one argument at a time. The available options are:\n"+
                        "\`\`\`\n"+
                        "welcome\n"+
                        "rules\n"+
                        "roles"+
                        "\`\`\`",
                    type: "string"
                }
            ]
        });
    }

    async run(message, {name}) {
        // Get the first word argument from the name
        let input = name.split(/ +/)[0]

        // attempt to send the embed if the input is a valid name type
        if (embedMessages.hasOwnProperty(input)) {
            let embedInfo = embedMessages[input];
            // modify command for multiple embed info
            if (embedInfo.length) {
                embedInfo.forEach(async (info, index) => {
                    const embedMessage = await createEmbedMessage(info);
                    const msg = await message.say(embedMessage);
                    if (embedInfo[index].hasOwnProperty("reactions")) {
                        embedInfo[index]["reactions"].forEach(emoteID => msg.react(message.client.emojis.cache.get(emoteID)));
                    }
                })
                message.delete()
            } else {
                const embedMessage = await createEmbedMessage(embedInfo);
                const msg = await message.say(embedMessage);

                message.delete()
            }
        } else message.reply(`\`${input}\` is not a valid input name.`);

        async function createEmbedMessage(info) {
            // create an embed message using the info from the rules.json file
            let embedMessage = new MessageEmbed()
                .setTitle(info["title"])
                .setColor(info["color"])
                .setDescription(info["description"])

                // optional properties
                if (info.hasOwnProperty("thumbnail")) embedMessage.setThumbnail(info["thumbnail"])
                if (info.hasOwnProperty("fields")) {
                    for (let key in info["fields"]) {
                        embedMessage.addField(info["fields"][key]["name"], info["fields"][key]["value"]);
                    }
                }
            return embedMessage;
        }
    }
};