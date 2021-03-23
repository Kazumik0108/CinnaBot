import { Channel, Guild, GuildEmoji, Role } from 'discord.js';
import { Connection } from 'typeorm';
import { Channel as EntityChannel, Guild as EntityGuild, Reaction, ReactionRole } from '../../entity';

function getEntity(obj: unknown): any {
  if (obj instanceof Channel) return EntityChannel;
  if (obj instanceof Guild) return EntityGuild;
  if (obj instanceof GuildEmoji) return Reaction;
  if (obj instanceof Role) return ReactionRole;
  return null;
}

export const handleIDQuery = async (obj: Channel | Guild | GuildEmoji | Role, conn: Connection) => {
  const entity = getEntity(obj);
  if (!entity) {
    console.log('An invalid object input was given for the query: ', obj);
    return null;
  }

  const query = await conn.getRepository(entity).createQueryBuilder('e').where('e.id = :id', { id: obj.id }).getOne();
  return query;
};
