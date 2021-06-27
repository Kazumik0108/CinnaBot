import { Guild, GuildEmoji, MessageEmbed, Role, TextChannel } from 'discord.js';
import { Connection } from 'typeorm';
import { Entities } from '../common/enums';
import { getRepository, isChannelRepo, isEmbedRepo, isGuildRepo, isReactionRepo, isRoleRepo } from './repository';

export async function validateGuild(conn: Connection, guild: Guild) {
  const repo = getRepository(conn, Entities.Guild);
  if (repo != null && isGuildRepo(repo)) {
    return (await repo.createQueryBuilder('e').where('e.id = :id', { id: guild.id }).getCount()) > 0;
  }
  return false;
}

export async function validateChannel(conn: Connection, channel: TextChannel) {
  const repo = getRepository(conn, Entities.Channel);
  if (repo != null && isChannelRepo(repo)) {
    return (
      (await repo
        .createQueryBuilder('e')
        .where('e.id = :id', { id: channel.id })
        .andWhere('e.guildId = :guildId', { guildId: channel.guild.id })
        .getCount()) > 0
    );
  }
  return false;
}

export async function validateEmbed(conn: Connection, guild: Guild, embed: MessageEmbed) {
  const repo = getRepository(conn, Entities.Embed);
  if (repo != null && isEmbedRepo(repo)) {
    return (
      (await repo
        .createQueryBuilder('e')
        .where('e.title = :title', { title: embed.title as string })
        .andWhere('e.guildId = :guildId', { guildId: guild.id })
        .getCount()) > 0
    );
  }
  return false;
}

export async function validateReaction(conn: Connection, reaction: GuildEmoji) {
  const repo = getRepository(conn, Entities.Reaction);
  if (repo != null && isReactionRepo(repo)) {
    return (
      (await repo
        .createQueryBuilder('e')
        .where('e.id = :id', { id: reaction.id })
        .andWhere('e.guildId = :guildId', { guildId: reaction.guild.id })
        .getCount()) > 0
    );
  }
  return false;
}

export async function validateRole(conn: Connection, role: Role) {
  const repo = getRepository(conn, Entities.Role);
  if (repo != null && isRoleRepo(repo)) {
    return (
      (await repo
        .createQueryBuilder('e')
        .where('e.id = :id', { id: role.id })
        .andWhere('e.guildId = :guildId', { guildId: role.guild.id })
        .getCount()) > 0
    );
  }
  return false;
}
