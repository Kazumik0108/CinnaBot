import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Guild } from '../../entity';
import { handleConnection } from '../../handlers/database/handleConnection';

export default class registerGuilds extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'registerguilds',
      aliases: ['regguilds', 'reggs', 'rgs'],
      memberName: 'registerguilds',
      group: 'database',
      ownerOnly: true,
      description: 'Manually force the database to register all guilds to the database, if they do not already exist.',
    });
  }

  async run(message: CommandoMessage) {
    const conn = await handleConnection();
    const guildQueries = await conn.getRepository(Guild).createQueryBuilder('g').getMany();

    const guilds = message.client.guilds.cache.filter((g) => guildQueries.every((gq) => gq.id != g.id));

    if (guilds.size == 0) {
      message.reply('all guilds have already been registered into the database.');
      return null;
    }

    const values = guilds.map((g) => {
      const value = { id: g.id, name: g.name };
      return value;
    });

    await conn.createQueryBuilder().insert().into(Guild).values(values).orIgnore('g.id').execute();

    const names = guilds.map((g) => g.name).join('\n');
    message.reply(`the following guilds have been added to the database:\n\`\`\`\n${names}\n\`\`\``);

    return null;
  }
}
