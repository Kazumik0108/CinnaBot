// roleupdate.ts
import {
  ClientUser,
  ColorResolvable,
  EmbedFieldData,
  Guild,
  MessageEmbed,
  PermissionResolvable,
  Role,
  RoleData,
} from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import roleperms from '../../info/roleperms.json';

interface promptArgs {
  roleName: string;
}

function getRoleEmbed(role: Role, maxPos: number): MessageEmbed {
  // Get all permissions directly from the role, ignoring ADMIN overrides
  const rolePerms = roleperms.filter((perm) => {
    try {
      return role.permissions.has(perm as PermissionResolvable, false);
    } catch (error) {
      return false;
    }
  });

  const fieldData: EmbedFieldData[] = [
    {
      name: 'Admin',
      value: role.permissions.toArray().includes('ADMINISTRATOR').toString().toUpperCase(),
      inline: false,
    },
    { name: 'Hoisted', value: role.hoist.toString().toUpperCase(), inline: true },
    { name: 'Color', value: role.hexColor.toUpperCase(), inline: true },
    { name: `Position (${maxPos} max)`, value: role.position, inline: true },
    { name: 'Permissions', value: rolePerms.join('\n'), inline: false },
  ];

  const embedMessage = new MessageEmbed()
    .setTitle('Update Role')
    .setDescription(`<@&${role.id}>`)
    .setColor(role.hexColor)
    .addFields(fieldData);

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
      examples: ['+roleupdate Gems'],
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
    // Check if there are multiple case-insensitive matches. If so, ask the user to choose from them
    // Otherwise, inform the user that no roles exist with the given name
    Promise.resolve((message.guild as Guild).roles.cache.filter((role) => role.name === roleName).first()).then(
      async (role) => {
        if (role) {
          // get the bot's highest role with MANAGE_ROLES permissions in the server to determine the highest position it can move the role to
          const botRole = message.guild?.members.cache
            .get((message.client.user as ClientUser).id)
            ?.roles.cache.filter((botRoles) => botRoles.permissions.has('MANAGE_ROLES'))
            .first();

          // show current role properties to user and give instructions
          const embedMessage = getRoleEmbed(role, (botRole?.position as number) - 1);
          const prompt = await message.reply(
            `here are the current properties for the role ${roleName}.\n` +
              'Change the role name with `name <name>`\n' +
              'Toggle displaying the role separately from online members, say `hoist <TRUE/FALSE>`\n' +
              'Change the role color with `color <color>`. Use `0` for the default Discord color.\n' +
              'Update the position of the role with `position <number>`, where 0 is `@everyone`. The max value is determined by the position of the bot.\n' +
              'Add or delete role permissions with `add/del <permission>,<permission>`. This includes the `ADMINISTRATOR` permission.\n' +
              'This command is automatically proceed after 2 minutes. Enter `next` to proceed early or `cancel` to cancel the command.\n',
          );
          const embedPrompt = await message.say(embedMessage);

          // show the user the changes in real-time
          const embedEdit = new MessageEmbed()
            .setTitle(embedMessage.title)
            .setDescription(embedMessage.description)
            .setColor(embedMessage.color as ColorResolvable)
            .addFields(embedMessage.fields);

          const filter = (msg: CommandoMessage) => msg.author === message.author;
          const collector = message.channel.createMessageCollector(filter, { time: 30 * 1000 });
          const options = ['next', 'name', 'hoist', 'color', 'position', 'add', 'del', 'cancel'];

          collector.on('collect', (collect) => {
            collector.resetTimer({ time: 30 * 1000 });
            const args: string = collect.content;

            // next
            if (args.toLowerCase().startsWith(options[0])) collector.stop();

            // cancel
            if (args.toLowerCase().startsWith(options[options.length - 1])) collector.stop();

            // name - description
            if (args.toLowerCase().startsWith(options[1])) {
              const inputName = args.slice(options[1].length);
              embedEdit.setDescription(`~~${embedMessage.description}~~ ${inputName}`);
            }

            // hoist - field[1]
            if (args.toLowerCase().startsWith(options[2])) {
              const inputHoist = args.slice(options[2].length).toUpperCase().trim();
              if (inputHoist === 'TRUE') {
                if (embedMessage.fields[1].value === 'TRUE') {
                  embedEdit.fields[1].value = 'TRUE';
                } else {
                  embedEdit.fields[1].value = `~~${embedMessage.fields[1].value}~~ ${inputHoist.toUpperCase()}`;
                }
              } else if (inputHoist === 'FALSE' && embedMessage.fields[1].value === 'FALSE') {
                if (embedMessage.fields[1].value === 'FALSE') {
                  embedEdit.fields[1].value = 'FALSE';
                } else {
                  embedEdit.fields[1].value = `~~${embedMessage.fields[1].value}~~ ${inputHoist.toUpperCase()}`;
                }
              }
            }

            // color - field[2]
            if (args.toLowerCase().startsWith(options[3])) {
              let inputColor = args.slice(options[3].length).toUpperCase().trim();

              // confirm the color is a valid hex code
              if (inputColor === '0') inputColor = '#000000';
              const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

              if (inputColor.match(hexRegex) && embedMessage.fields[2].value !== '#000000') {
                embedEdit.setColor(inputColor);
                embedEdit.fields[2].value = `~~${embedMessage.fields[2].value}~~ ${inputColor}`;
              }
            }

            // position - field[3]
            if (args.toLowerCase().startsWith(options[4])) {
              const inputPos = parseInt(args.slice(options[4].length).trim(), 10);
              // Update the position if it does not exceed the max position allowed
              if (inputPos < (botRole?.position as number) - 1) {
                embedEdit.fields[3].value = `~~${embedMessage.fields[3].value}~~ ${inputPos}`;
              }
            }

            // admin - field[0]
            // perms - field[4]
            // add <rolePerm>
            if (args.toLowerCase().startsWith(options[5])) {
              const inputPerms = args
                .slice(options[5].length)
                .trim()
                .toUpperCase()
                .split(/,*\s+,*/g);

              // only add new, valid permissions
              const rolePerms = embedMessage.fields[4].value.split('\n');
              let currPerms = embedEdit.fields[4].value.split('\n');
              inputPerms.forEach((permission) => {
                const perm = permission === 'ADMIN' ? 'ADMINISTRATOR' : permission;
                if (roleperms.includes(perm)) {
                  // if the perm used to exist on the role originally, add it without formatting
                  // else, if the perm is new, add it with formatting
                  // else, do nothing
                  if (rolePerms.includes(perm)) {
                    currPerms = currPerms.map((currPerm) =>
                      currPerm.includes(perm) ? currPerm.replace(/~+/g, '') : currPerm,
                    );
                  } else if (!currPerms.some((currPerm) => currPerm.includes(perm))) {
                    currPerms.push(`**+ ${perm}**`);
                  }

                  // update admin field if the added permission is server administrator and the role doesn't have the perm already
                  // if the role had admin originally, reset the field value
                  if (perm === 'ADMINISTRATOR') {
                    if (embedMessage.fields[0].value === 'TRUE') {
                      embedEdit.fields[0].value = 'TRUE';
                    } else {
                      embedEdit.fields[0].value = `~~${embedMessage.fields[0].value}~~ TRUE`;
                    }
                  }
                }
              });

              // update embed message permissions field
              embedEdit.fields[4].value = currPerms.join('\n');
            }

            // del <rolePerm>
            if (args.toLowerCase().startsWith(options[6])) {
              const inputPerms = args
                .slice(options[6].length)
                .trim()
                .toUpperCase()
                .split(/,*\s+,*/g);
              // only delete existing, valid permissions
              let currPerms = embedEdit.fields[4].value.split('\n');
              inputPerms.forEach((permission) => {
                const perm = permission === 'ADMIN' ? 'ADMINISTRATOR' : permission;
                if (roleperms.includes(perm)) {
                  // if the deleted rolePerm did not exist on the role originally, delete it without formatting
                  if (!embedMessage.fields[4].value.split('\n').includes(perm)) {
                    currPerms = currPerms.filter((currPerm) => !currPerm.includes(perm));
                  } else {
                    currPerms = currPerms.map((currPerm) => (currPerm.includes(perm) ? `~~${currPerm}~~` : currPerm));
                  }

                  // update admin field if the deleted permission is server administrator and the role has the perm
                  // if the role did not have admin originally, reset the field value
                  if (perm === 'ADMINISTRATOR') {
                    if (embedMessage.fields[0].value === 'FALSE') {
                      embedEdit.fields[0].value = 'FALSE';
                    } else {
                      embedEdit.fields[0].value = `~~${embedMessage.fields[0].value}~~ FALSE`;
                    }
                  }
                }
              });

              // update embed message permissions field
              embedEdit.fields[4].value = currPerms.join('\n');
            }

            // update the embed message after a valid command
            embedPrompt.edit(embedEdit);
          });

          collector.on('end', (collected) => {
            // do not update the role if any message contained cancel
            if (collected.every((msg) => !msg.content.includes('cancel'))) {
              // resend the embed edit and then update the role properties
              embedPrompt.edit(embedEdit);

              const roleData = getRoleData(embedEdit, embedMessage);
              role
                .edit(roleData)
                .then(() =>
                  message
                    .reply(`the role \`${role.name}\` has successfully been updated.`)
                    .then((confirmMsg) => confirmMsg.delete({ timeout: 5000 })),
                );
            } else {
              message.reply('canceling the command.').then((cancelMsg) => cancelMsg.delete({ timeout: 5000 }));
            }

            // delete all collected messages
            prompt.delete({ timeout: 5000 });
            embedPrompt.delete({ timeout: 5000 });
            collected.forEach((msg) => msg.delete({ timeout: 5000 }).catch(() => console.error));
          });
        } else {
          message
            .reply(`there is no role with the name \`${roleName}\`.`)
            .then((reply) => reply.delete({ timeout: 10 * 1000 }));
        }
      },
    );

    function getRoleData(edit: MessageEmbed, msg: MessageEmbed): RoleData {
      const name = () => {
        if (edit.description !== msg.description) {
          return (edit.description as string)
            .replace(msg.description as string, '')
            .replace(/~+/g, '')
            .trim();
        } else {
          return undefined;
        }
      };
      const hoist = () => {
        if (edit.fields[1].value !== msg.fields[1].value) {
          return edit.fields[1].value.replace(msg.fields[1].value, '').replace(/~+/g, '').trim() === 'TRUE';
        } else {
          return undefined;
        }
      };
      const color = () => {
        if (edit.fields[2].value !== msg.fields[2].value) {
          return edit.fields[2].value.replace(msg.fields[2].value, '').replace(/~+/g, '').trim();
        } else {
          return undefined;
        }
      };
      const position = () => {
        if (edit.fields[3].value !== msg.fields[3].value) {
          return parseInt(edit.fields[3].value.replace(msg.fields[3].value, '').replace(/~+/g, '').trim(), 10);
        } else {
          return undefined;
        }
      };
      const perms = () => {
        if (edit.fields[4].value !== msg.fields[4].value) {
          return edit.fields[4].value
            .split('\n')
            .filter((permission) => !permission.includes('~'))
            .map((permission) => permission.replace(/\++|\*+/g, '').trim());
        } else {
          return undefined;
        }
      };

      const roleData: RoleData = {
        name: name(),
        hoist: hoist(),
        color: color() as ColorResolvable,
        position: position(),
        permissions: perms() as PermissionResolvable,
      };
      return roleData;
    }

    return null;
  }
}
