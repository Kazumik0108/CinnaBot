// roleupdate.ts
import { ColorResolvable, Guild, MessageEmbed, PermissionResolvable, Role } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import roleperms from '../../info/roleperms.json';


interface promptArgs {
    roleName: string
}


function getMessageEmbed(role: Role) {
    const embedMessage = new MessageEmbed()
        .setTitle('Update Role')
        .setDescription(`<@&${role.id}>`)
        .setColor(role.hexColor)
        .addField('Color', role.hexColor.toUpperCase(), true)
        .addField('Admin', role.permissions.toArray().includes('ADMINISTRATOR').toString().toUpperCase(), true)
        .addField('Permissions', `${role.permissions.toArray().join('\n')}`);
    return embedMessage;
}


export default class addrole extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'roleupdate',
            group: 'server',
            memberName: 'roleupdate',
            description: 'Updates a specific role in the server.',
            guildOnly: true,
            clientPermissions: ['MANAGE_ROLES'],
            userPermissions: ['MANAGE_ROLES'],
            format: '+roleupdate <roleName>',
            examples: [
                '+roleupdate Gems',
            ],
            args: [
                {
                    key: 'roleName',
                    prompt: 'Specify the name of the role you want to update.',
                    type: 'string',
                },
            ],
        });
    }


    async run(message: CommandoMessage, { roleName }: promptArgs): Promise<null> {
        // Abort command if no role exists with the specified name in the server
        const roles = (message.guild as Guild).roles.cache.filter(role => role.name === roleName);
        if (roles.size === 0) {
            message.reply(`there is no role with the name \`${roleName}\`.`).then(reply => reply.delete({ timeout: 10 * 1000 }));
            return null;
        }
        const role = roles.first() as Role;


        // show current role properties to user
        const embedMessage = getMessageEmbed(role);
        const prompt = await message.reply(`here are the current properties for the role ${roleName}.\n` +
            'Change the role name with `name <name>`\n' +
            'Change the role color with `color <color>`. Use `0` to use the default Discord color.\n' +
            'Add or delete role permissions with `add/del <permission>,<permission>`. This includes the `ADMINISTRATOR` permission.\n' +
            'This command is automatically proceed after 2 minutes. Enter `next` to proceed early.\n');
        const embedPrompt = await message.say(embedMessage);

        // ask the user for changes
        const embedEdit = new MessageEmbed()
            .setTitle(embedMessage.title)
            .setDescription(embedMessage.description)
            .setColor(embedMessage.color as ColorResolvable)
            .addFields(embedMessage.fields);

        const filter = (msg: CommandoMessage) => msg.author === message.author;
        const collector = message.channel.createMessageCollector(filter, { time: 30 * 1000 });
        const options = ['next', 'name ', 'color ', 'add ', 'del '];

        collector.on('collect', collect => {
            const args: string = collect.content;
            // next
            if (args.toLowerCase().startsWith(options[0])) collector.stop();

            // name
            if (args.toLowerCase().startsWith(options[1])) {
                const inputName = args.slice(options[1].length);
                embedEdit.setDescription(`~~${embedMessage.description}~~ ${inputName}`);
            }

            // color
            if (args.toLowerCase().startsWith(options[2])) {
                const inputColor = args.slice(options[2].length).toUpperCase();
                // confirm the color is a valid hex code
                const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                if (inputColor.match(hexRegex)) {
                    embedEdit.setColor(inputColor);
                    embedEdit.fields[0]['value'] = `~~${embedMessage.fields[0]['value']}~~ ${inputColor}`;
                }
            }

            // add <rolePerm>
            if (args.toLowerCase().startsWith(options[3])) {
                const inputPerms = args.slice(options[3].length).toUpperCase().split(/,*\s+,*/g);
                // only add new, valid permissions
                const currPerms = embedEdit.fields[2]['value'].split('\n');
                inputPerms.forEach(perm => {
                    const isNewPerm = !currPerms.some(currPerm => currPerm.includes(perm));
                    if (isNewPerm && roleperms.includes(perm)) {
                        currPerms.push(`**+ ${perm}**`);
                        // update admin field if the new permission is server administrator
                        if (perm === 'ADMINISTRATOR') embedMessage.fields[1]['value'] = `~~${embedMessage.fields[0]['value']}~~ TRUE`;
                    }
                });
                embedEdit.fields[2]['value'] = currPerms.join('\n');
            }

            // del <rolePerm>
            if (args.toLowerCase().startsWith(options[4])) {
                const inputPerms = args.slice(options[4].length).toUpperCase().split(/,*\s+,*/g);
                // only delete existing, valid permissions
                let currPerms = embedEdit.fields[2]['value'].split('\n');
                inputPerms.forEach(perm => {
                    if (roleperms.includes(perm)) {
                        currPerms = currPerms.map(currPerm => (currPerm.includes(perm)) ? `~~${currPerm}~~` : currPerm);
                    }
                });
                embedEdit.fields[2]['value'] = currPerms.join('\n');
            }

            // update the embed message after a valid command
            embedPrompt.edit(embedEdit);
        });

        collector.on('end', collected => {
            // resend the embed edit and then update the role properties
            embedPrompt.edit(embedEdit);

            // name
            let newName = embedEdit.description as string;
            if (newName !== embedMessage.description) {
                newName = newName.replace(embedMessage.description as string, '').replace(/~+/g, '').trim();
                role.setName(newName).catch(console.error);
            }

            // color
            const newColor = embedEdit.hexColor as string;
            role.setColor(newColor).catch(console.error);

            // perms
            let newPerms = embedEdit.fields[2]['value'].split('\n');
            newPerms = newPerms.map(permission => {
                // return unmodified or new perms only
                if (permission.includes('~')) return '';
                else if (permission.includes('*')) return permission.replace(/\*+|\++/g, '').trim();
                else return permission;
            });
            newPerms = newPerms.filter(perm => perm !== '');
            role.setPermissions(newPerms as PermissionResolvable).catch(console.error);

            // delete all collected messages
            prompt.delete({ timeout: 5000 });
            embedPrompt.delete({ timeout: 5000 });
            collected.forEach(msg => msg.delete({ timeout: 5000 }).catch(() => console.error));

        });


        return null;
    }
}