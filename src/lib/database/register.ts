import { Guild, GuildEmoji, MessageEmbed, Role, TextChannel } from 'discord.js';
import { Connection } from 'typeorm';
import { Entities } from '../common/enums';
import { getRepository, isChannelRepo, isEmbedRepo, isGuildRepo, isReactionRepo, isRoleRepo } from './repository';
import { validateChannel, validateEmbed, validateGuild, validateReaction, validateRole } from './validate';

export async function registerGuild(conn: Connection, guild: Guild) {
  const exists = await validateGuild(conn, guild);
  if (exists) return null;

  const repo = getRepository(conn, Entities.Guild);
  if (repo != null && isGuildRepo(repo)) {
    return await repo.createQueryBuilder().insert().values({ id: guild.id, name: guild.name }).execute();
  }
  return null;
}

export async function registerChannel(conn: Connection, channel: TextChannel) {
  const exists = await validateChannel(conn, channel);
  if (exists) return null;

  const repo = getRepository(conn, Entities.Channel);
  if (repo != null && isChannelRepo(repo)) {
    return await repo.createQueryBuilder().insert().values({ id: channel.id, name: channel.name }).execute();
  }
  return null;
}

export async function registerReaction(conn: Connection, reaction: GuildEmoji) {
  const exists = await validateReaction(conn, reaction);
  if (exists) return null;

  const repo = getRepository(conn, Entities.Reaction);
  if (repo != null && isReactionRepo(repo)) {
    return await repo.createQueryBuilder().insert().values({ id: reaction.id, name: reaction.name }).execute();
  }
  return null;
}

export async function registerRole(conn: Connection, role: Role) {
  const exists = await validateRole(conn, role);
  if (exists) return null;

  const repo = getRepository(conn, Entities.Role);
  if (repo != null && isRoleRepo(repo)) {
    return await repo.createQueryBuilder().insert().values({ id: role.id, name: role.name }).execute();
  }
  return null;
}

export async function registerEmbed(conn: Connection, guild: Guild, embed: MessageEmbed) {
  const exists = await validateEmbed(conn, guild, embed);
  if (exists) return null;

  const repo = getRepository(conn, Entities.Embed);
  if (repo != null && isEmbedRepo(repo)) {
    return await repo
      .createQueryBuilder()
      .insert()
      .values({ title: embed.title as string, embed: embed })
      .execute();
  }
  return null;
}
