import { ColorResolvable, Message, MessageEmbed, Permissions, PermissionString, Role, RoleData } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';

import { convertDecimalToHexColor, convertHexToDecimalColor } from '../../functions/embedFilters';

export interface RoleDataEmbedInputs {
  message: Message | CommandoMessage;
  roleData: RoleData;
}

const createdRoleDataEmbed = (data: RoleData, message: Message, role?: Role) => {
  const perms = <string[]>data.permissions?.toString().split(/,/g);
  const permsFirst = perms.slice(0, Math.ceil(perms.length / 2));
  const permsLast = perms.slice(Math.ceil(perms.length / 2), perms.length);

  const isAdmin = perms.includes('ADMINISTRATOR').toString().toUpperCase();
  const isMentionable = (<boolean>data.mentionable).toString().toUpperCase();
  const isHoisted = (<boolean>data.hoist).toString().toUpperCase();

  const colorHex = convertDecimalToHexColor(<number>data.color);

  const embed = new MessageEmbed()
    .setAuthor(message.author.username, message.author.displayAvatarURL())
    .setTitle('Role Properties')
    .setColor(<ColorResolvable>data.color)
    .setDescription(role || data.name)
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
        value: data.position,
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

export const getRoleData = (role: Role) => {
  const data: RoleData = {
    name: role.name,
    color: role.color,
    hoist: role.hoist,
    position: role.rawPosition,
    mentionable: role.mentionable,
    permissions: role.permissions,
  };
  return data;
};

export const handleRoleDataEmbed = async (options: RoleDataEmbedInputs) => {
  const embed = createdRoleDataEmbed(options.roleData, options.message);
  return embed;
};
