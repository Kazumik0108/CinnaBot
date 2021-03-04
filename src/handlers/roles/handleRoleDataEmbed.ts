import { ColorResolvable, MessageEmbed } from 'discord.js';
import { RoleDataEmbedInputs } from '../../lib/common/interfaces';

export const handleRoleDataEmbed = ({ message, roleData, role }: RoleDataEmbedInputs) => {
  const perms = <string[]>roleData.permissions?.toString().split(/,/g);
  const permsFirst = perms.slice(0, Math.ceil(perms.length / 2));
  const permsLast = perms.slice(Math.ceil(perms.length / 2), perms.length);

  const isAdmin = perms.includes('ADMINISTRATOR').toString().toUpperCase();
  const isMentionable = (<boolean>roleData.mentionable).toString().toUpperCase();
  const isHoisted = (<boolean>roleData.hoist).toString().toUpperCase();

  const position = roleData.position;
  const colorHex = roleData.color;
  const description = role != undefined ? role.toString() : roleData.name;

  const embed = new MessageEmbed()
    .setAuthor(message.author.username, message.author.displayAvatarURL())
    .setTitle('Role Properties')
    .setColor(<ColorResolvable>roleData.color)
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
