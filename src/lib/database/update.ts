import { Guild, MessageEmbed, TextChannel } from 'discord.js';
import { Connection } from 'typeorm';
import { EmbedEntity } from '../../entity';
import { bind } from './bind';

export async function updateEmbed(
  conn: Connection,
  record: EmbedEntity,
  embed: MessageEmbed,
  guild: Guild,
  channel?: TextChannel,
) {
  await conn
    .createQueryBuilder()
    .update(EmbedEntity)
    .set({ title: embed.title as string, embed: embed })
    .where('uuid =:uuid', { uuid: record.uuid })
    .execute();
  await bind(conn, { type: 'embed', args: { uuid: record.uuid, guild: guild, channel: channel } });
}
