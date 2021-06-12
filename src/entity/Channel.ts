import { Guild, GuildChannel } from 'discord.js';
import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { Base, EmbedEntity, GuildEntity } from '.';
import { getGuildChannel } from '../lib/utils/guild/channel';

@Entity({ name: 'channels' })
export class ChannelEntity extends Base {
  @ManyToOne(() => GuildEntity, (guild) => guild.channels)
  guild!: GuildEntity;

  @OneToMany(() => EmbedEntity, (embed) => embed.channel, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  embeds!: EmbedEntity[];

  getChannel = (guild: Guild) => getGuildChannel(this.id, guild) as GuildChannel;
}
