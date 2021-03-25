import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Guild } from '../../entity/Guild';
import { handleConnection } from '../../handlers/database/handleConnection';
import { handleQueryEmbed } from '../../handlers/database/handleQueryEmbed';
import { EntityOutput } from '../../lib/common/types';

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
    const queries = await conn.createQueryBuilder().select('g').from(Guild, 'g').getMany();

    const embed = <MessageEmbed>await handleQueryEmbed(message, conn, (Guild as unknown) as EntityOutput, queries);
    message.embed(embed);
    return null;
  }
}
