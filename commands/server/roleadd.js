// roleadd.js

///// imports
const { MessageEmbed } = require("discord.js")

///// functions
function getMessageEmbed(name, hexColor, perms) {
    const embedMessage = new MessageEmbed()
        .setTitle("Role Properties")
        .setDescription(name)
        .setColor(hexColor)
        .addField("Color", hexColor, true)
        .addField("Admin", perms.includes("ADMINISTRATOR").toString().toUpperCase(), true)
        .addField("Permissions", `${perms.join("\n")}`)
    return embedMessage;
}


///// imports
const { Command } = require("discord.js-commando");
const roleperms = require("../../info/roleperms.json");

module.exports = class roleadd extends Command {
    constructor(client) {
        super(client, {
            name: "roleadd",
            group: "server",
            memberName: "roleadd",
            description: "Creates a named role within the server with optional colors and permissions.",
            guildOnly: true,
            clientPermissions: ["MANAGE_ROLES"],
            userPermissions: ["MANAGE_ROLES"],
            examples: [
                "+roleadd \`<roleName>\`",
                "+roleadd \`<roleName>\` \`<roleColor>\`",
                "+roleadd \`<roleName>\` \`<roleColor>\` \`<rolePerm>\`,\`<rolePerm>\`"
            ],
            args: [
                {
                    key: "roleName",
                    prompt: "Specify the name of the role you would like to create.",
                    type: "string"
                },
                {
                    key: "roleColor",
                    prompt: "Specify the hex code of the color for this role. Enter \`0\` to use the default color.",
                    type: "string"
                },
                {
                    key: "rolePerms",
                    prompt: "Specify the permissions for this role, separated by commas and no spaces. Type \`DEFAULT\` to use the following permissions:\n"+
                        "\`\`\`\n"+
                        "VIEW_CHANNEL, SEND_MESSAGES, ADD_REACTIONS, USE_EXTERNAL_EMOJIS"+
                        "\`\`\`",
                    type: "string"
                }
            ]
        });
    }

    async run(message, {roleName, roleColor, rolePerms}) {
        // Abort command if roleName already exists in the server
        let name = await message.guild.roles.fetch()
            .then(roles => {
                if (roles.cache.some(role => role.name === roleName)) {
                    message.reply(`There is already a role with the name \`${roleName}\`. Please try another name.`).then(msg => msg.delete({ timeout: 5000 }));
                    return null;
                } else return roleName;
            })
            .catch(console.error);
        if (name === null) return;
        
        // Set roleColor to default 0 if the hex code is invalid
        // Slice the # character from the valid hex code then convert to decimal
        // Also get the original hex color code for confirmation later
        let color = roleColor;
        if (color !== 0) {
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            color = (roleColor.match(hexRegex)) ? parseInt(roleColor.slice(1), 16) : 0;
        } else color = roleColor;
        const hexColor = (color === 0) ? "#000000" : ["#", color.toString(16).toUpperCase()].join("");

        // Set default permissions if asked for
        // Filter out invalid role permissions. If there are no valid permissions, then set to default
        let perms = rolePerms.split(/\,/).map(perm => perm.trim().toUpperCase());
        if (perms[0].toLowerCase() === "default") perms = perms = ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS"];
        perms = perms.filter(perm => roleperms.includes(perm));
        if (perms.length === 0) perms.push("VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS");

        // confirm with the user the role name, color, and additional permissions
        // proceed with creating the role if confirmed
        // cancel the command if rejected
        let embedMessage = getMessageEmbed(name, hexColor, perms);
        let reply = await message.reply("verify the properties for the role you are creating.\nReact with 👍 to create the role. React with 👎 to cancel the command.")
        let msg = await message.say(embedMessage);
        msg.react("👍").then(() => msg.react("👎"));

        const filter = (reaction, user) => ["👍", "👎"].includes(reaction.emoji.name) && user.id === message.author.id;
        msg.awaitReactions(filter, { max: 1, time: 10*1000, errors: ["time"] })
            .then(collected => {
                const reaction = collected.first();
                if (reaction.emoji.name === "👍") {
                    const guild = message.client.guilds.cache.get(message.guild.id);
                    guild.roles.create({
                        data: {
                            name: name,
                            color: color,
                            permissions: perms
                        }
                    })
                        .then(role => message.reply(`The role <@&${role.id}> has been created successfully.`).then(reply => reply.delete({ timeout: 5000 })))
                        .catch(console.error);
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