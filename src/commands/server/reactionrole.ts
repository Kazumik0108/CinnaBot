import { Message, Role } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { handleConnection } from '../../handlers/database/handleConnection';
import { handleReactionRoleEdit } from '../../handlers/database/handleReactionRoleEdit';
import { handleReactionRoleQuery } from '../../handlers/database/handleReactionRoleQuery';
import { getGuildRole } from '../../lib/utils/guild/getGuildRole';

interface PromptArgs {
  role: Role;
}

export default class reactionRoleUpdate extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'reactionrole',
      aliases: ['rrole'],
      group: 'server',
      memberName: 'reactionrole',
      description: 'Update a reaction role',
      guildOnly: true,
      args: [
        {
          key: 'role',
          prompt: 'Specify the name of the reaction role to edit.',
          type: 'string',
          validate: (name: string, m: Message) => {
            const role = getGuildRole(name, m);
            return role != null ? true : false;
          },
          parse: (name: string, m: Message) => {
            const role = getGuildRole(name, m);
            return role;
          },
          error: 'No roles with this name exist in this server. Try another name.',
        },
      ],
    });
  }

  async run(message: CommandoMessage, { role }: PromptArgs) {
    const conn = await handleConnection();
    const guild = message.guild;

    const rrole = await handleReactionRoleQuery(role, conn, guild);
    await handleReactionRoleEdit(rrole, conn, message);
    message
      .delete({ timeout: 5 * 1000 })
      .catch((e) => console.log('Failed to delete the reaction role command message: ', e));

    return null;
  }
}
