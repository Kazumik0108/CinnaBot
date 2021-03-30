import { Role } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Guild, ReactionRole } from '../../entity';
import { handleConnection } from '../../handlers/database/handleConnection';
import { handleIDQuery } from '../../handlers/database/handleIDQuery';
import { getGuildRole } from '../../lib/utils/guild/getGuildRole';

interface PromptArgs {
  role: Role;
}

export default class RegisterReactionRole extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'registerreactionrole',
      aliases: ['regreactionrole', 'regrr', 'rrr'],
      memberName: 'registerreactionrole',
      group: 'database',
      description: 'Register a role into the database to use as a reaction role for this guild',
      args: [
        {
          key: 'role',
          prompt: 'Specify the id or name of the role to register. The input is case-sensitive.',
          type: 'string',
          validate: (property: string, msg: CommandoMessage) => {
            const role = getGuildRole(property, msg.guild);
            return role != null ? true : false;
          },
          parse: (property: string, msg: CommandoMessage) => {
            const role = <Role>getGuildRole(property, msg.guild);
            return role;
          },
        },
      ],
    });
  }

  async run(message: CommandoMessage, { role }: PromptArgs) {
    const conn = await handleConnection();

    const guild = (await handleIDQuery(role.guild, conn)) as Guild | null | undefined;
    if (guild == null || guild == undefined) {
      message.reply(
        `${message.guild} must first be registered to the database. Try using the command \`+registerguilds\`.`,
      );
      return null;
    }

    const queryRole = await conn
      .createQueryBuilder()
      .select('r')
      .from(ReactionRole, 'r')
      .where('r.id = :id', { id: role.id })
      .getOne();

    if (queryRole) {
      message.reply(`the role ${role} has already been registered into the database.`);
      return null;
    }

    await conn.createQueryBuilder().insert().into(ReactionRole).values({ id: role.id, name: role.name }).execute();

    await conn.createQueryBuilder().relation(ReactionRole, 'guild').of(role.id).set(guild);

    message.reply(`the role \`${role.name}\` has been registered to ${message.guild}.`);

    return null;
  }
}
