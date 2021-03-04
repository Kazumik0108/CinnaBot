import { ColorResolvable, Message, MessageEmbed, Role, RoleData } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { convertColor } from '../../lib/utils/color/convertColor';

export interface RoleDataEmbedInputs {
  message: Message | CommandoMessage;
  roleData: RoleData;
  role?: Role;
}

export const getRoleData = (role: Role) => {
  const data: RoleData = {
    name: role.name,
    color: role.color,
    hoist: role.hoist,
    position: role.rawPosition,
    mentionable: role.mentionable,
    permissions: role.permissions.toArray(),
  };
  return data;
};

export const handleRoleDataEmbed = (options: RoleDataEmbedInputs) => {
  const message = options.message;
  const data = options.roleData;
  const role = options.role;

  const perms = <string[]>data.permissions?.toString().split(/,/g);
  const permsFirst = perms.slice(0, Math.ceil(perms.length / 2));
  const permsLast = perms.slice(Math.ceil(perms.length / 2), perms.length);

  const isAdmin = perms.includes('ADMINISTRATOR').toString().toUpperCase();
  const isMentionable = (<boolean>data.mentionable).toString().toUpperCase();
  const isHoisted = (<boolean>data.hoist).toString().toUpperCase();

  const position = data.position;
  const colorHex = convertColor({ input: String(data.color), option: 'decToHex' });
  const description = role != undefined ? role.toString() : data.name;

  const embed = new MessageEmbed()
    .setAuthor(message.author.username, message.author.displayAvatarURL())
    .setTitle('Role Properties')
    .setColor(<ColorResolvable>data.color)
    .setDescription(description)
    .addFields([
      {
        name: 'Admin',
        value: isAdmin,
        inline: false,
      },
      {
        name: 'Mentionable',
        value: isMentionable,
        inline: false,
      },
      {
        name: 'Hoisted',
        value: isHoisted,
        inline: true,
      },
      {
        name: 'Position',
        value: position,
        inline: true,
      },
      {
        name: 'Hex Color',
        value: colorHex,
        inline: true,
      },
      {
        name: 'Permissions',
        value: permsFirst,
        inline: true,
      },
      {
        name: '(cont.)',
        value: permsLast,
        inline: true,
      },
    ]);
  return embed;
};
