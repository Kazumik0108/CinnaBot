// addrole.js

///// imports
const { Command } = require("discord.js-commando");
const roleperms = require("../../info/roleperms.json");

module.exports = class addrole extends Command {
    constructor(client) {
        super(client, {
            name: "addrole",
            group: "server",
            memberName: "addrole",
            description: "Creates a named role within the server with optional colors and permissions.",
            guildOnly: true,
            examples: [
                "+addrole \`<roleName>\`",
                "+addrole \`<roleName>\` \`<roleColor>\`",
                "+addrole \`<roleName>\` \`<roleColor>\` \`<rolePerm>\`,\`<rolePerm>\`"
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
        // Only allow members with manage roles to use this command
        const user = message.guild.member(message.author);
        let userRole = user.roles.cache.filter(role => role.permissions.toArray().includes("MANAGE_ROLES") || role.permissions.toArray().includes("ADMINISTRATOR"));
        userRole = Array.from(userRole.values());
        if (userRole.length > 1) {
            userRole.sort(function(a, b) {
                return (a.rawPosition > b.rawPosition) ? -1 : 1;
            });
        }
        userRole = userRole[0];
        if (!userRole) return message.reply("you are not allowed to add roles.").then(reply => reply.delete({ timeout: 10*1000}));

        // get the bots highest role with the MANAGE_ROLES permission
        const bot = message.guild.member(message.client.user);
        let botRole = bot.roles.cache.filter(role => role.permissions.toArray().includes("MANAGE_ROLES") || role.permissions.toArray().includes("ADMINISTRATOR"));
        botRole = Array.from(botRole.values());
        if (botRole.length > 1) {
            botRole.sort(function(a, b) {
                return (a.rawPosition > b.rawPosition) ? -1 : 1;
            });
        }
        botRole = botRole[0];
        if (!botRole) return message.reply("I do not have the \`MANAGE_ROLES\` permission for this command.").then(reply => reply.delete({ timeout: 10*1000}));

        // Abort command if roleName already exists in the server
        let name = await message.guild.roles.fetch()
            .then(roles => {
                if (roles.cache.some(role => role.name === roleName)) {
                    message.reply(`There is already a role with the name \`${roleName}\`. Please try another name.`);
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
        const msg = await message.reply(`verify the properties for the role you are creating.\nReact with 👍 to create the role. React with 👎 to cancel the command.\n`+
            `\`\`\`\n`+
            `Role Name: ${name}\n`+
            `Role Color: ${hexColor}\n`+
            `Role Permissions: ${perms}\n`+
            `\`\`\``);
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
            .finally(() => msg.delete({ timeout: 3000 }))
    }
};