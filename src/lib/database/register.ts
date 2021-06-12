import { Guild, GuildEmoji, MessageEmbed, Role, TextChannel } from 'discord.js';
import { Connection } from 'typeorm';
import { getRepository, isChannelRepo, isEmbedRepo, isGuildRepo, isReactionRepo, isRoleRepo } from './getRepository';
import { validate } from './validate';

interface RegisterArgs {
  conn: Connection;
  guild: Guild;
  entity: string;
  channel?: TextChannel;
  embed?: MessageEmbed;
  reaction?: GuildEmoji;
  role?: Role;
}

export async function registerOne({ conn, guild, entity, channel, embed, reaction, role }: RegisterArgs) {
  const repo = getRepository(conn, entity);
  if (repo == null) return;

  if (isChannelRepo(repo)) {
    if (channel == undefined) return console.log('A guild text channel must be provided to register a channel record.');
    const exists = await validate(conn, guild, entity, channel.id);
    if (exists) return console.log('This text channel record exists already.');
    await repo.createQueryBuilder().insert().values({ id: channel.id, name: channel.name }).execute();
    return;
  }

  if (isEmbedRepo(repo)) {
    if (channel == undefined || embed == undefined) {
      return console.log('A guild text channel and embed object must be provided to register an embed record.');
    }
    const exists = await validate(conn, guild, entity, <string>embed.title);
    if (exists) return console.log('This embed message record exists already.');
    await repo
      .createQueryBuilder()
      .insert()
      .values({ title: <string>embed.title, embed: embed })
      .execute();
    return;
  }

  if (isGuildRepo(repo)) {
    const exists = await validate(conn, guild, entity);
    if (exists) return console.log('This guild record exists already.');
    await repo.createQueryBuilder().insert().values({ id: guild.id, name: guild.name }).execute();
    return;
  }

  if (isReactionRepo(repo)) {
    if (reaction == undefined) return console.log('A guild emoji must be provided to register a reaction record.');
    const exists = await validate(conn, guild, entity, reaction.id);
    if (exists) return console.log('This reaction record exists already.');
    await repo.createQueryBuilder().insert().values({ id: reaction.id, name: reaction.name }).execute();
    return;
  }

  if (isRoleRepo(repo)) {
    if (role == undefined) return console.log('A guild role must be provided to register a role record.');
    const exists = await validate(conn, guild, entity, role.id);
    if (exists) return console.log('This role record exists already.');
    await repo.createQueryBuilder().insert().values({ id: role.id, name: role.name }).execute();
    return;
  }
}
