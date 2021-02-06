// gem.js

///// imports
const path = require("path");
const { MessageEmbed } = require("discord.js");
const { Command } = require("discord.js-commando");
const { Gems } = require(path.join(__dirname,"../../info/geminfo.json"));

module.exports = class gemInfo extends Command {
    constructor(client) {
        super(client, {
            name: "gem",
            group: "wiki",
            memberName: "gem",
            description: "Sends the information for the specified gem",
            guildOnly: true,
            args: [
                {
                    key: "names",
                    prompt: "Which gem(s) would you to see? Separate names with a space.",
                    type: "string"
                },
            ],
        });
    }

    async run(message, {names}) {
        // convert the Gems object into an array
        const gems = Object.entries(Gems);

        // get all of the arguments from the names input
        const args_all = names.toLowerCase().trim().split(/ +/);

        // remove duplicates from args
        const args = args_all.reduce((unique, item) => {
            return unique.includes(item) ? unique : [unique, item];
        });

        // if multiple gem names are given, loop
        // else send in the single arguments
        if (Array.isArray(args)) {
            for (const alias of args) {
                sendEmbed(alias, gems)
            }
        } else {
            sendEmbed(args, gems)
        }

        function sendEmbed(alias, gems) {
            // checks for alias matches from the reference gems array
            // if matched, send an embed message for the specified gem
            // else tell the user there is no match

            // checks for matches
            const match = (element) => element === alias;
                    
            // perform the check on each gem in the Gems list
            var matched = false;
            for (var gem of gems) {
                if (gem[1].Alias.some(match)) {   
                    var matched = true;
                    const embedMessage = createEmbed(gem[1]);
                    message.say(embedMessage);
                    break;
                }
            }

            if (!matched) {
                message.reply(`there are no gems with the name \`${alias}\`.`)
            }
        }

        function createEmbed(gem) {
            // create an embed message based on the gem input
            const embedMessage = new MessageEmbed()
                .setColor(gem.Color)
                .setTitle(gem.Title)
                .setDescription(gem.Description)
                .setThumbnail(gem.Thumbnail)
                .setImage(gem.Image)
                .setFooter(gem.Footer)

            // add fields from input file
            for (const [index, field] of Object.entries(gem.Fields)) {
                const name = Object.keys(field);
                const value = Object.values(field);

                // inline formatting
                if (index <= 2) {
                    embedMessage.addField(name,value,true);
                } else {
                    embedMessage.addField(name,value);
                }
            }

            return embedMessage;
        }
    }
};