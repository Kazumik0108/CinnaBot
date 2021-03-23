import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Guild } from '../../entity/Guild';
import { handleConnection } from '../../handlers/database/handleConnection';

export default class registerGuilds extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'registerguilds',
      aliases: ['regguilds', 'regg'],
      memberName: 'registerguilds',
      group: 'database',
      description: 'Manually force the database to register all guilds to the database, if they do not already exist.',
    });
  }

  async run(message: CommandoMessage) {
    const guilds = message.client.guilds.cache.array();
    const values = guilds.map((g) => {
      const value = { id: g.id, name: g.name };
      return value;
    });

    const conn = await handleConnection();

    conn.createQueryBuilder().insert().into(Guild).values(values).orIgnore('g.id').execute();

    return null;
  }
}
