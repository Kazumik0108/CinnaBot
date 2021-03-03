import { Message, Role } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

import { getGuildRole, GetGuildRoleOptions } from '../../functions/guildFilters';
import { handleRoleDataArgs, roleArgsPrompt, RoleDataArgs } from '../../handlers/roles/handleRoleDataArgs';
import {
  handleRoleDataConfirmation,
  RoleDataConfirmationOptions,
} from '../../handlers/roles/handleRoleDataConfirmation';
import { handleRoleDataEdit } from '../../handlers/roles/handleRoleDataEdit';
import { getRoleData, handleRoleDataEmbed, RoleDataEmbedInputs } from '../../handlers/roles/handleRoleDataEmbed';

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
        {
          key: 'args',
          prompt: roleArgsPrompt(),
          type: 'string',
          validate: (args: string) => {
            const match = args.match(/^(?:color|hoist|position|perm add|perm del|default)/);
            return match != null ? true : false;
          },
          parse: (args: string, m: Message) => handleRoleDataArgs(args, m),
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
