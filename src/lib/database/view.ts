import { Guild, MessageEmbed } from 'discord.js';
import { Connection } from 'typeorm';
import { GuildEntity } from '../../entity';
import { Entities } from '../common/enums';
import { isGuildEntity } from './getEntity';
import { selectOneByID } from './select';

interface GuildViewArgs {
  guild: string;
  channels: string;
  embeds: string;
  reactions: string;
  roles: string;
}

export async function guildView(conn: Connection, guild: Guild) {
  const entity = await selectOneByID(conn, guild, Entities.Guild);
  if (entity == undefined || !isGuildEntity(entity)) return null;

  entity.channels = await conn.createQueryBuilder().relation(GuildEntity, 'channels').of(guild.id).loadMany();
  entity.embeds = await conn.createQueryBuilder().relation(GuildEntity, 'embeds').of(guild.id).loadMany();
  entity.reactions = await conn.createQueryBuilder().relation(GuildEntity, 'reactions').of(guild.id).loadMany();
  entity.roles = await conn.createQueryBuilder().relation(GuildEntity, 'roles').of(guild.id).loadMany();

  const view: GuildViewArgs = {
    guild: entity.name,
    channels: entity.channels.map((c) => c.getChannel(guild)).join('\n'),
    embeds: entity.embeds.map((e) => e.title).join('\n'),
    reactions: entity.reactions.map((r) => `${r.getReaction(guild)} \\${r.getReaction(guild)}`).join('\n'),
    roles: entity.roles.map((r) => r.getRole(guild)).join('\n'),
  };

  const none = '`No entries`';
  const embed = new MessageEmbed()
    .setTitle(view.guild)
    .setThumbnail(guild.iconURL() as string)
    .addFields([
      {
        name: 'Channels',
        value: view.channels || none,
      },
      {
        name: 'Embed Messages',
        value: view.embeds || none,
      },
      {
        name: 'Reactions',
        value: view.reactions || none,
      },
      {
        name: 'Roles',
        value: view.roles || none,
      },
    ]);
  return embed;
}
