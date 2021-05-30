import { CommandoMessage } from 'discord.js-commando';
import { Connection } from 'typeorm';
import { Guild } from '../../entity';

export const handleRegisterGuild = async (message: CommandoMessage, conn: Connection) => {
  const queryGuild = await conn
    .createQueryBuilder()
    .select('g')
    .from(Guild, 'g')
    .where('g.id = :id', { id: message.guild.id })
    .getOne();

  if (queryGuild) {
    message.reply(`the guild ${message.guild} has already been registered into the database.`);
    return;
  }

  await conn
    .createQueryBuilder()
    .insert()
    .into(Guild)
    .values({ id: message.guild.id, name: message.guild.name })
    .execute();

  message.reply(`the guild ${message.guild} has been registered into the database.`);
  return;
};
