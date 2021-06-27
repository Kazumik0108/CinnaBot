import { EmbedFieldData, Guild, MessageEmbed } from 'discord.js';
import { Connection } from 'typeorm';
import { GuildEntity } from '../../entity';
import { Entities, GuildRelations } from '../common/enums';
import { GuildViewArgs, GuildViewOptions } from '../common/interfaces';
import { isGuildEntity } from './entity';
import { load } from './load';
import { selectOneByID } from './select';

const none = '`No entries`';

export async function createGuildView(conn: Connection, guild: Guild, options?: GuildViewOptions) {
  const record = await selectOneByID(conn, guild, Entities.Guild);
  if (record == undefined || !isGuildEntity(record)) return null;

  await load(conn, record, options?.ignore);
  const view: GuildViewArgs = {
    guild: guildName(record),
    channels: guildChannels(record, guild) || none,
    embeds: guildEmbedTitles(record) || none,
    reactions: guildReactions(record, guild) || none,
    roles: guildRoles(record, guild) || none,
  };

  let fields: EmbedFieldData[] = [
    {
      name: GuildRelations.channel,
      value: view.channels,
    },
    {
      name: GuildRelations.embed,
      value: view.embeds,
    },
    {
      name: GuildRelations.reaction,
      value: view.reactions,
    },
    {
      name: GuildRelations.role,
      value: view.roles,
    },
  ];

  if (options != undefined && options.ignore != undefined) {
    const ignore = options.ignore;
    fields = fields.filter((f) => ignore.some((i) => i != f.name));
  }

  const embed = new MessageEmbed()
    .setTitle(view.guild)
    .setDescription(options?.description || '**__Records__**')
    .setThumbnail(guild.iconURL() as string)
    .addFields(fields);
  return embed;
}

function guildName(record: GuildEntity) {
  return record.name;
}

function guildChannels(record: GuildEntity, guild: Guild) {
  return record.channels != undefined ? record.channels.map((c) => c.getChannel(guild)).join('\n') : null;
}

function guildEmbedTitles(record: GuildEntity) {
  return record.embeds != undefined ? record.embeds.map((e) => e.title).join('\n') : null;
}

function guildReactions(record: GuildEntity, guild: Guild) {
  return record.reactions != undefined ? record.reactions.map((r) => r.getReaction(guild)).join('\n') : null;
}

function guildRoles(record: GuildEntity, guild: Guild) {
  return record.roles != undefined ? record.roles.map((r) => r.getRole(guild)).join('\n') : null;
}
