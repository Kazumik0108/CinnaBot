import { Guild } from 'discord.js';
import { Connection } from 'typeorm';
import { getRepository, isEmbedRepo, isGuildRepo } from './getRepository';

export async function selectOneByID(conn: Connection, guild: Guild, entity: string, id?: string) {
  const repo = getRepository(conn, entity);
  if (repo == null) return undefined;

  if (isEmbedRepo(repo)) {
    console.log('Embed messages cannot be selected with this method. Use selectOneByName instead.');
    return undefined;
  }

  if (isGuildRepo(repo)) {
    return await repo.createQueryBuilder('e').where('e.id = :id', { id: guild.id }).getOne();
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

export async function selectOneByName(conn: Connection, guild: Guild, entity: string, name: string) {
  const repo = getRepository(conn, entity);
  if (repo == null) return undefined;

  if (isGuildRepo(repo)) {
    return await repo.createQueryBuilder('e').where('e.id = :id', { id: guild.id }).getOne();
  }

  if (isEmbedRepo(repo)) {
    if (name == undefined) {
      console.log('No name was provided to select an embed record.');
      return undefined;
    }

    return await repo
      .createQueryBuilder('e')
      .where('e.title = :title', { title: name })
      .andWhere('e.guildId = :guildId', { guildId: guild.id })
      .getOne();
  }

  if (name == undefined) {
    console.log('No id was provided to select a record.');
    return undefined;
  }

  return await repo
    .createQueryBuilder('e')
    .where('e.name = :name', { name: name })
    .andWhere('e.guildId = :guildId', { guildId: guild.id })
    .getOne();
}
