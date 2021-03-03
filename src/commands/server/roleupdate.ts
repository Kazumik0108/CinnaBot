import { Role } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { roleArgsPrompt, handleRoleDataArgs } from '../../handlers/roles/handleRoleDataArgs';
import { handleRoleDataConfirmation } from '../../handlers/roles/handleRoleDataConfirmation';
import { handleRoleDataEdit } from '../../handlers/roles/handleRoleDataEdit';
import { getRoleData, RoleDataEmbedInputs, handleRoleDataEmbed } from '../../handlers/roles/handleRoleDataEmbed';
import { RoleDataArgs, RoleDataConfirmationOptions } from '../../lib/types/common/interfaces';
import { getGuildRole } from '../../lib/utils/guildFilters';

interface PromptArgs {
  role: Role;
  args: RoleDataArgs;
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
        {
          key: 'args',
          prompt: roleArgsPrompt(),
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
    const reply = await message.reply('Confirm with a reaction to update the role or abort the command.', embed);

    const confirm: RoleDataConfirmationOptions = {
      options: options,
      watch: reply,
      type: 'update',
    };
    await handleRoleDataConfirmation(message, confirm);
    return null;
  }
}
