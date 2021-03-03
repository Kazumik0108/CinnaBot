import { Guild as DiscordGuild, Role } from 'discord.js';
import { Connection } from 'typeorm';
import { Guild } from '../../entity/Guild';
import { ReactionRole } from '../../entity/ReactionRole';
import { handleGuildQuery } from './handleGuildQuery';

export const createReactionRoleEntity = async (role: Role, conn: Connection, guild: Guild) => {
  await conn
    .createQueryBuilder()
    .insert()
    .into(ReactionRole)
    .values([
      {
        id: role.id,
        name: role.name,
        guild: guild,
      },
    ])
    .execute();
};

export const handleReactionRoleQuery = async (role: Role, conn: Connection, discordGuild: DiscordGuild) => {
  let rrole = await conn
    .getRepository(ReactionRole)
    .createQueryBuilder('r')
    .where('r.id =:id', { id: role.id })
    .getOne();
  if (!rrole) {
    const guild = await handleGuildQuery(discordGuild, conn);
    await createReactionRoleEntity(role, conn, guild);
  }
  rrole = await conn.getRepository(ReactionRole).createQueryBuilder('r').where('r.id =:id', { id: role.id }).getOne();
  return rrole as ReactionRole;
};
