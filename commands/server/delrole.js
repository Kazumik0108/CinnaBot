// delrole.js

///// imports
const { Command } = require("discord.js-commando");

module.exports = class addrole extends Command {
    constructor(client) {
        super(client, {
            name: "delrole",
            group: "server",
            memberName: "delrole",
            description: "Deletees the specified role from the server.",
            guildOnly: true,
            examples: [
                "+delrole \`<roleName>\`"
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
        if (!userRole) return message.reply("you are not allowed to delete roles.").then(reply => reply.delete({ timeout: 10*1000}));

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

        // Abort command if no role exists with the specified name in the server
        let role = await message.guild.roles.cache.filter(role => role.name === roleName);
        if (role.size === 0) return message.reply(`there is no role with the name \`${roleName}\`.`).then(reply => reply.delete({ timeout: 10*1000}));
        role = role.first()

        // the user is only allowed to delete roles below their role with the MANAGE_ROLES permission
        // UNLESS they have administrator permissions or are the owner of the server
        // However, the bot can only manage roles beneath its role with the MANAGE_ROLES permission
        if (userRole.rawPosition > role.rawPosition || userRole.permissions.toArray().includes("ADMINISTRATOR") || message.guild.ownerID === message.author.id) {
            if (botRole.rawPosition < role.rawPosition) return message.reply(`the role \`${roleName}\` you are trying to delete is higher than my position and I am not an admin.`).then(reply => reply.delete({ timeout: 10*1000}));
            
            // ask the user to confirm deleting the role
            const msg = await message.reply(`verify the role you want to delete.\nReact with 👍 to delete the role. React with 👎 to cancel the command.\n`+
                `\`\`\`\n`+
                `Role Name: ${role.name}\n`+
                `Role Permissions: ${role.permissions.toArray()}\n`+
                `\`\`\``);
            msg.react("👍").then(() => msg.react("👎"));

            const filter = (reaction, user) => ["👍", "👎"].includes(reaction.emoji.name) && user.id === message.author.id;
            msg.awaitReactions(filter, { max: 1, time: 10*1000, errors: ["time"] })
                .then(collected => {
                    const reaction = collected.first();
                    if (reaction.emoji.name === "👍") {
                        role.delete()
                            .then(() => message.reply(`the role \`${roleName}\` has successfully been deleted.`).then(reply => reply.delete({ timeout: 5000})))
                            .catch(console.error);
                    } else {
                        message.reply("canceling command.").then(reply => reply.delete({ timeout: 3000 }));
                    }
                })
                .catch(() => {
                    message.reply("the command has timed out.").then(reply => reply.delete({ timeout: 5000 }));
                })
                .finally(() => msg.delete({ timeout: 3000 }))
        } else {
            message.reply(`the role \`${roleName}\` you are trying to delete is higher than your position and you are not an admin.`).then(reply => reply.delete({ timeout: 10*1000}))
        }

        
        
    }
};