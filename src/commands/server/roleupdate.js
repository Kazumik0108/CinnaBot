// roleupdate.js

///// imports
const { MessageEmbed } = require("discord.js")
const { Command } = require("discord.js-commando");
const roleperms = require("../../info/roleperms.json");

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

///// exports
module.exports = class addrole extends Command {
    constructor(client) {
        super(client, {
            name: "roleupdate",
            group: "server",
            memberName: "roleupdate",
            description: "Updates a specific role in the server.",
            guildOnly: true,
            clientPermissions: ["MANAGE_ROLES"],
            userPermissions: ["MANAGE_ROLES"],
            examples: [
                "+roleupdate \`<roleName>\` "
            ],
            args: [
                {
                    key: "roleName",
                    prompt: "Specify the name of the role you want to update.",
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

        // show current role properties to user
        const embedMessage = getMessageEmbed(role);
        const reply = await message.reply(`here are the current properties for the role ${roleName}.\n`+
            `Change the role name with \`name <name>\`\n`+
            `Change the role color with \`color <color>\`. Use \`0\` to use the default Discord color.\n`+
            `Add or delete role permissions with \`add/del <permission>,<permission>\`. This includes the \`ADMINISTRATOR\` permission.\n`+
            `This command is automatically proceed after 2 minutes. Enter \`next\` to proceed early.\n`);
        const msg = await message.say(embedMessage);

        // ask the user for changes
        const embedEdit = new MessageEmbed()
            .setTitle(embedMessage.title)
            .setDescription(embedMessage.description)
            .setColor(embedMessage.color)
            .addFields(embedMessage.fields)

        const filter = (msg) => msg.author === message.author
        const collector = message.channel.createMessageCollector(filter, { time: 30*1000, errors: ["time"] })
        const options = ["next", "name ", "color ", "add ", "del "];

        collector.on("collect", collect => {
            const args = collect.content;
            if (args.toLowerCase().startsWith(options[0])) collector.stop();
            
            if (args.toLowerCase().startsWith(options[1])) {
                const inputName = args.slice(options[1].length);
                embedEdit.setDescription(`~~${embedMessage.description}~~ ${inputName}`);
            }
            
            if (args.toLowerCase().startsWith(options[2])) {
                const inputColor = args.slice(options[2].length).toUpperCase();
                // confirm the color is a valid hex code
                const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                if (inputColor.match(hexRegex)) {
                    embedEdit.setColor(inputColor);
                    embedEdit.fields[0]["value"] = `~~${embedMessage.fields[0]["value"]}~~ ${inputColor}`
                }
            }

            if (args.toLowerCase().startsWith(options[3])) {
                const inputPerms = args.slice(options[3].length).toUpperCase().split(/,*\s+,*/g);
                // only add new, valid permissions
                let currPerms = embedEdit.fields[2]["value"].split("\n");
                inputPerms.forEach(perm => {
                    const isNewPerm = !currPerms.some(currPerm => currPerm.includes(perm));
                    if (isNewPerm && roleperms.includes(perm)) {
                        currPerms.push(`**+ ${perm}**`);
                        // update admin field if the new permission is server administrator
                        if (perm === "ADMINISTRATOR") embedMessage.fields[1]["value"] = `~~${embedMessage.fields[0]["value"]}~~ TRUE`;
                    }
                });
                embedEdit.fields[2]["value"] = currPerms.join("\n");
            }
            
            if (args.toLowerCase().startsWith(options[4])) {
                const inputPerms = args.slice(options[4].length).toUpperCase().split(/,*\s+,*/g);;
                // only delete existing, valid permissions
                let currPerms = embedEdit.fields[2]["value"].split("\n");
                inputPerms.forEach(perm => {
                    if (roleperms.includes(perm)) {
                        currPerms = currPerms.map(currPerm => (currPerm.includes(perm)) ? `~~${currPerm}~~` : currPerm);
                    }
                });
                embedEdit.fields[2]["value"] = currPerms.join("\n");
            }

            // update the embed message after a valid command
            msg.edit(embedEdit);
        });

        collector.on("end", collected => {
            msg.edit(embedEdit);
            
            // update the role properties
            let newName = embedEdit.description;
            if (newName !== embedMessage.description)  {
                newName = newName.replace(embedMessage.description, "").replace(/~+/g, "").trim();
                role.setName(newName).catch(console.error);
            }
            
            let newColor = embedEdit.hexColor;
            role.setColor(newColor).catch(console.error);

            let newPerms = embedEdit.fields[2]["value"].split("\n");
            newPerms = newPerms.map(permission => {
                // return unmodified or new perms only
                if (permission.includes("~")) return "";
                else if (permission.includes("\*")) return permission.replace(/\*+|\++/g, "").trim();
                else return permission;
            });
            newPerms = newPerms.filter(perm => perm !== "");
            role.setPermissions(newPerms).catch(console.error);

            // delete all collected messages
            collected.forEach(msg => msg.delete({ timeout: 5000 }).catch(() => console.error));
            
        }); 
    
    }
};