import { Role } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { handleRoleDataArgs, roleArgsPrompt } from '../../handlers/roles/handleRoleDataArgs';
import { handleRoleDataConfirmation } from '../../handlers/roles/handleRoleDataConfirmation';
import { handleRoleDataEdit } from '../../handlers/roles/handleRoleDataEdit';
import { handleRoleDataEmbed } from '../../handlers/roles/handleRoleDataEmbed';
import { RoleDataArgs, RoleDataEmbedInputs } from '../../lib/common/interfaces';
import { getGuildRole } from '../../lib/utils/guild/role';
import { getRoleData } from '../../lib/utils/role/getRoleData';

interface PromptArgs {
  role: Role;
  args: RoleDataArgs;
}

export default class RoleEdit extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'roleedit',
      aliases: ['redit'],
      group: 'server',
      memberName: 'roleedit',
      description: 'Updates a specific role in the server.',
      guildOnly: true,
      clientPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES'],
      format: '+roleupdate <roleName>',
      examples: ['+roleupdate Gems'],
      args: [
        {
          key: 'role',
          prompt: 'Specify the name of the role you want to delete.',
          type: 'string',
          validate: (name: string, m: CommandoMessage) => {
            const role = getGuildRole(name, m.guild);
            return role != null ? true : false;
          },
          parse: (name: string, m: CommandoMessage) => {
            const role = <Role>getGuildRole(name, m.guild);
            return role;
          },
          error: 'No roles with this name exist in this server. Try another name.',
        },
        {
          key: 'args',
          prompt: roleArgsPrompt.update,
          type: 'string',
          validate: (args: string) => {
            const match = args.match(/^(?:color|hoist|position|perm add|perm del|default)/);
            return match != null ? true : false;
          },
          parse: (args: string, m: CommandoMessage) => handleRoleDataArgs(args, m),
        },
      ],
    });
  }

  async run(message: CommandoMessage, { role, args }: PromptArgs) {
    let data = getRoleData(role);
    data = handleRoleDataEdit(data, args);
    const options: RoleDataEmbedInputs = {
      message: message,
      roleData: data,
      role: role,
    };

    const embed = handleRoleDataEmbed(options);
    const target = await message.reply('Confirm with a reaction to update the role or abort the command.', embed);

    await handleRoleDataConfirmation(message, target, options, 'update');
    return null;
  }
}
