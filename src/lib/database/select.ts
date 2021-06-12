import { Guild } from 'discord.js';
import { Connection } from 'typeorm';
import { getRepository, isEmbedRepo, isGuildRepo } from './getRepository';

export async function selectOne(conn: Connection, guild: Guild, entity: string, id?: string, title?: string) {
  const repo = getRepository(conn, entity);
  if (repo == null) return undefined;

  if (isGuildRepo(repo)) {
    return await repo.createQueryBuilder('e').where('e.id = :id', { id: guild.id }).getOne();
  }

  if (isEmbedRepo(repo)) {
    if (title == undefined) {
      console.log('No title was provided to validate embed record.');
      return undefined;
    }

    return await repo
      .createQueryBuilder('e')
      .where('e.title = :title', { title: title })
      .andWhere('e.guildId = :guildId', { guildId: guild.id })
      .getOne();
  }

  if (id == undefined) {
    console.log('No id was provided to select a record.');
    return undefined;
  }

  return await repo
    .createQueryBuilder('e')
    .where('e.id = :id', { id: id })
    .andWhere('e.guildId = :guildId', { guildId: guild.id })
    .getOne();
}
