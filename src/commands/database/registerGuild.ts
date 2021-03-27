import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Guild } from '../../entity';
import { handleConnection } from '../../handlers/database/handleConnection';

export default class registerGuild extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'registerguild',
      aliases: ['regguild', 'regg', 'rg'],
      memberName: 'registerguild',
      group: 'database',
      description: 'Register the current guild to the database.',
      guildOnly: true,
    });
  }

  async run(message: CommandoMessage) {
    const conn = await handleConnection();

    const queryGuild = await conn
      .createQueryBuilder()
      .select('g')
      .from(Guild, 'g')
      .where('g.id = :id', { id: message.guild.id })
      .getOne();

    if (queryGuild) {
      message.reply(`the guild ${message.guild} has already been registered into the database.`);
      return null;
    }

    await conn
      .createQueryBuilder()
      .insert()
      .into(Guild)
      .values({ id: message.guild.id, name: message.guild.name })
      .execute();

    message.reply(`the guild ${message.guild} has been registered into the database.`);
    return null;
  }
}
