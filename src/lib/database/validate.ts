import { Guild } from 'discord.js';
import { Connection } from 'typeorm';
import { getRepository, isEmbedRepo, isGuildRepo } from './getRepository';

export async function validateByID(conn: Connection, guild: Guild, entity: string, id?: string, title?: string) {
  const repo = getRepository(conn, entity);
  if (repo == null) {
    console.log('Invalid repository provided for validate record: ', entity);
    return false;
  }

  if (isGuildRepo(repo)) {
    return (await repo.createQueryBuilder('e').where('e.id = :id', { id: guild.id }).getCount()) > 0;
  }

  if (isEmbedRepo(repo)) {
    if (title == undefined) {
      console.log('No title was provided to validate embed record.');
      return false;
    }

    return (
      (await repo
        .createQueryBuilder('e')
        .where('e.title = :title', { title: title })
        .andWhere('e.guildId = :guildId', { guildId: guild.id })
        .getCount()) > 0
    );
  }

  if (id == undefined) {
    console.log('No id was provided to validate record.');
    return false;
  }

  return (
    (await repo
      .createQueryBuilder('e')
      .where('e.id = :id', { id: id })
      .andWhere('e.guildId = :guildId', { guildId: guild.id })
      .getCount()) > 0
  );
}
