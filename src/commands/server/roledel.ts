import { Role } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { handleRoleDataConfirmation } from '../../handlers/roles/handleRoleDataConfirmation';
import { handleRoleDataEmbed } from '../../handlers/roles/handleRoleDataEmbed';
import { RoleDataEmbedInputs } from '../../lib/common/interfaces';
import { getGuildRole } from '../../lib/utils/guild/getGuildRole';
import { getRoleData } from '../../lib/utils/role/getRoleData';

interface PromptArgs {
  role: Role;
}

export default class RoleDel extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'roledel',
      aliases: ['rdel'],
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
            const role = getGuildRole(name, m);
            return role != null ? true : false;
          },
          parse: (name: string, m: CommandoMessage) => {
            const role = <Role>getGuildRole(name, m);
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

    await handleRoleDataConfirmation({ message: message, options: options, target: reply, type: 'delete' });
    return null;
  }
}
