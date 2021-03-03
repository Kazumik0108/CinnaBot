import { Guild as DiscordGuild } from 'discord.js';
import { Connection } from 'typeorm';
import { Guild } from '../../entity/Guild';

export const createGuildEntity = async (discordGuild: DiscordGuild, conn: Connection) => {
  await conn
    .createQueryBuilder()
    .insert()
    .into(Guild)
    .values([
      {
        id: discordGuild.id,
        name: discordGuild.name,
      },
    ])
    .execute();
};

export const handleGuildQuery = async (discordGuild: DiscordGuild, conn: Connection) => {
  let guild = await conn
    .getRepository(Guild)
    .createQueryBuilder('g')
    .where('g.id =:id', { id: discordGuild.id })
    .getOne();
  if (!guild) await createGuildEntity(discordGuild, conn);
  guild = await conn.getRepository(Guild).createQueryBuilder('g').where('g.id =:id', { id: discordGuild.id }).getOne();
  return guild as Guild;
};
