import { CommandoMessage } from 'discord.js-commando';
import { Connection } from 'typeorm';
import { Guild as EntityGuild } from '../../entity';
import { handleIDQuery } from './handleIDQuery';

export const handleGuildCheck = async (message: CommandoMessage, conn: Connection) => {
  const queryGuild = (await handleIDQuery(message.guild, conn)) as EntityGuild | null | undefined;
  if (!(queryGuild instanceof EntityGuild)) {
    message.reply(
      `${message.guild} must first be registered to the database. Try using the command \`+registerguild\`.`,
    );
    return null;
  }
  return queryGuild;
};
