// roledel.js

///// imports
const { MessageEmbed } = require("discord.js")
const { Command } = require("discord.js-commando");

///// functions
function getMessageEmbed(role) {
    const embedMessage = new MessageEmbed()
        .setTitle("Role Properties")
        .setDescription(`<@&${role.id}>`)
        .setColor(role.hexColor)
        .addField("Color", role.hexColor.toUpperCase(), true)
        .addField("Admin", role.permissions.toArray().includes("ADMINISTRATOR").toString().toUpperCase(), true)
        .addField("Permissions", `${role.permissions.toArray().join("\n")}`)
    return embedMessage;
}

module.exports = class addrole extends Command {
    constructor(client) {
        super(client, {
            name: "roledel",
            group: "server",
            memberName: "roledel",
            description: "Deletes the specified role from the server.",
            guildOnly: true,
            clientPermissions: ["MANAGE_ROLES"],
            userPermissions: ["MANAGE_ROLES"],
            examples: [
                "+roledel \`<roleName>\`"
            ],
            args: [
                {
                    key: "roleName",
                    prompt: "Specify the name of the role you want to delete.",
                    type: "string"
                }
            ]
        });
    }

    async run(message, {roleName}) {
        // Abort command if no role exists with the specified name in the server
        let role = await message.guild.roles.cache.filter(role => role.name === roleName);
        if (role.size === 0) return message.reply(`there is no role with the name \`${roleName}\`.`).then(reply => reply.delete({ timeout: 10*1000}));
        role = role.first()
            
        // ask the user to confirm deleting the role
        let embedMessage = getMessageEmbed(role);
        let reply = await message.reply("verify the role you want to delete.\nReact with 👍 to delete the role. React with 👎 to cancel the command.");
        let msg = await message.say(embedMessage);
        msg.react("👍").then(() => msg.react("👎"));

        const filter = (reaction, user) => ["👍", "👎"].includes(reaction.emoji.name) && user.id === message.author.id;
        msg.awaitReactions(filter, { max: 1, time: 10*1000, errors: ["time"] })
            .then(collected => {
                const reaction = collected.first();
                if (reaction.emoji.name === "👍") {
                    role.delete()
                        .then(() => message.reply(`the role \`${roleName}\` has successfully been deleted.`).then(reply => reply.delete({ timeout: 5000})))
                        .catch(error => message.say(error))
                } else {
                    message.reply("canceling command.").then(reply => reply.delete({ timeout: 3000 }));
                }
            })
            .catch(() => {
                message.reply("the command has timed out.").then(reply => reply.delete({ timeout: 5000 }));
            })
            .finally(() => {
                reply.delete({ timeout: 3000 })
                msg.delete({ timeout: 3000 })
            })
    }
};