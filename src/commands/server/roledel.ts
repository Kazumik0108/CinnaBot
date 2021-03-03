import { Role } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { handleRoleDataConfirmation } from '../../handlers/roles/handleRoleDataConfirmation';
import { getRoleData, RoleDataEmbedInputs, handleRoleDataEmbed } from '../../handlers/roles/handleRoleDataEmbed';
import { RoleDataConfirmationOptions } from '../../lib/types/common/interfaces';
import { getGuildRole } from '../../lib/utils/guildFilters';

interface PromptArgs {
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
          validate: (name: string, m: CommandoMessage) => {
            const role = getGuildRole({ message: m, property: name });
            return role != null ? true : false;
          },
          parse: (name: string, m: CommandoMessage) => {
            const role = <Role>getGuildRole({ message: m, property: name });
            return role;
          },
          error: 'No roles with this name exist in this server. Try another name.',
        },
      ],
    });
  }

  async run(message: CommandoMessage, { role }: PromptArgs) {
    const data = getRoleData(role);
    const options: RoleDataEmbedInputs = {
      message: message,
      roleData: data,
      role: role,
    };

    const embed = handleRoleDataEmbed(options);
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
