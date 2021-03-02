import { Message, PermissionResolvable, Role, RoleData } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

import { getGuildRole, GetGuildRoleOptions } from '../../functions/guildFilters';
import { handleRoleDataEmbed, RoleDataEmbedInputs } from '../../handlers/roles/handleRoleData';
// eslint-disable-next-line prettier/prettier
import { handleRoleDataConfirmation, RoleDataConfirmationOptions } from '../../handlers/roles/handleRoleDataConfirmation';

interface promptArgs {
  role: Role;
}

export default class addrole extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'roledel',
      group: 'server',
      memberName: 'roledel',
      description: 'Deletes the specified role from the server.',
      guildOnly: true,
      clientPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES'],
      format: '+roledel <roleName>',
      examples: ['+roledel Gems'],
      args: [
        {
          key: 'role',
          prompt: 'Specify the name of the role you want to delete.',
          type: 'string',
          validate: (name: string, m: Message) => {
            const options: GetGuildRoleOptions = {
              message: m,
              property: name,
            };
            const role = getGuildRole(options);
            return role != null ? true : false;
          },
          parse: (name: string, m: Message) => {
            const options: GetGuildRoleOptions = {
              message: m,
              property: name,
            };
            const role = <Role>getGuildRole(options);
            return role;
          },
          error: 'No roles with this name exist in this server. Try another name.',
        },
      ],
    });
  }

  async run(message: CommandoMessage, { role }: promptArgs) {
    const data: RoleData = {
      name: role.name,
      color: role.color,
      hoist: role.hoist,
      position: role.rawPosition,
      mentionable: role.mentionable,
      permissions: role.permissions.toArray(),
    };
    const options: RoleDataEmbedInputs = {
      message: message,
      roleData: data,
      role: role,
    };

    const embed = await handleRoleDataEmbed(options);
    const reply = await message.reply('Confirm with a reaction to delete the role or abort the command.', embed);

    const confirm: RoleDataConfirmationOptions = {
      options: options,
      watch: reply,
      type: 'delete',
    };
    await handleRoleDataConfirmation(message, confirm);
    return null;
  }
}
