// roleadd.ts
import { Guild, GuildMember, MessageEmbed, MessageReaction, PermissionResolvable } from 'discord.js';
import { CommandoClient, Command, CommandoMessage } from 'discord.js-commando';
import roleperms from '../../info/roleperms.json';


interface promptArgs {
    roleName: string,
    roleColor: string,
    rolePerms: string,
}


function getMessageEmbed(name: string, hexColor: string, perms: string[]): MessageEmbed {
    const embedMessage = new MessageEmbed()
        .setTitle('Add Role')
        .setDescription(name)
        .setColor(hexColor)
        .addField('Color', hexColor, true)
        .addField('Admin', perms.includes('ADMINISTRATOR').toString().toUpperCase(), true)
        .addField('Permissions', `${perms.join('\n')}`);
    return embedMessage;
}


export default class roleadd extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'roleadd',
            group: 'server',
            memberName: 'roleadd',
            description: 'Creates a named role within the server with optional colors and permissions.',
            guildOnly: true,
            clientPermissions: ['MANAGE_ROLES'],
            userPermissions: ['MANAGE_ROLES'],
            format: '+roleadd <roleName> <roleColor> <rolePerm>,<rolePerm>',
            examples: [
                '+roleadd Gems',
                '+roleadd Gems #012345',
                '+roleadd Gems #012345 MANAGE_CHANNELS, MANAGE_EMOJIS',
            ],
            args: [
                {
                    key: 'roleName',
                    prompt: 'Specify the name of the role you would like to create.',
                    type: 'string',
                },
                {
                    key: 'roleColor',
                    prompt: 'Specify the hex code of the color for this role. Enter `0` to use the default color.',
                    type: 'string',
                },
                {
                    key: 'rolePerms',
                    prompt: 'Specify the permissions for this role, separated by commas and no spaces. Type `DEFAULT` to use the following permissions:\n' +
                        '```\n' +
                        'VIEW_CHANNEL, SEND_MESSAGES, ADD_REACTIONS, USE_EXTERNAL_EMOJIS' +
                        '```',
                    type: 'string',
                },
            ],
        });
    }


    async run(message: CommandoMessage, { roleName, roleColor, rolePerms }: promptArgs): Promise<null> {
        // Abort command if roleName already exists in the server
        const name = await (message.guild as Guild).roles.fetch()
            .then(roles => {
                if (roles.cache.some(role => role.name === roleName)) {
                    message.reply(`There is already a role with the name \`${roleName}\`. Please try another name.`).then(msg => msg.delete({ timeout: 5000 }));
                    return null;
                }
                else {
                    return roleName;
                }
            })
            .catch(console.error);
        if (name === null) return null;


        // Check for a valid hex color code
        // Set the color to the default Discord color, otherwise
        let color = roleColor;
        if (color !== '0') {
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            color = (roleColor.match(hexRegex)) ? parseInt(roleColor.slice(1), 16).toString() : '#000000';
        }
        else {
            color = '#000000';
        }


        // Validate the permission inputs, unless default is specified
        // If none are valid, set to default
        let perms = rolePerms.split(/,/).map(perm => perm.trim().toUpperCase());
        if (perms[0].toLowerCase() !== 'default') {
            perms = perms.filter(perm => roleperms.includes(perm));
            if (perms.length === 0) {
                perms = ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS'];
            }
        }
        else {
            perms = ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS'];
        }


        // Confirm with the user the role name, color, and additional permissions
        // Proceed with creating the role if confirmed
        // Cancel the command if rejected
        const embedMessage = getMessageEmbed(name as string, color, perms);
        const reply = await message.reply('verify the properties for the role you are creating.\nReact with 👍 to create the role. React with 👎 to cancel the command.');
        const msg = await message.say(embedMessage);
        msg.react('👍').then(() => msg.react('👎'));


        const filter = (reaction: MessageReaction, user: GuildMember): boolean => {
            return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        msg.awaitReactions(filter, { max: 1, time: 10 * 1000, errors: ['time'] })
            .then(collected => {
                const reaction = collected.first() as MessageReaction;
                if (reaction.emoji.name === '👍') {
                    const guild = message.client.guilds.cache.get((message.guild as Guild).id) as Guild;
                    guild.roles.create({
                        data: {
                            name: name as string,
                            color: color,
                            permissions: perms as PermissionResolvable,
                        },
                    })
                        .then(role => message.reply(`The role <@&${role.id}> has been created successfully.`).then(confirmMsg => confirmMsg.delete({ timeout: 5000 })))
                        .catch(console.error);
                }
                else {
                    message.reply('canceling command.').then(cancelMsg => cancelMsg.delete({ timeout: 3000 }));
                }
            })
            .catch(() => {
                message.reply('the command has timed out.').then(abortMsg => abortMsg.delete({ timeout: 5000 }));
            })
            .finally(() => {
                reply.delete({ timeout: 3000 });
                msg.delete({ timeout: 3000 });
            });


        return null;
    }
}