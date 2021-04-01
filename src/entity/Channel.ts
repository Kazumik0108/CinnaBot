import { Guild as DiscordGuild, TextChannel } from 'discord.js';
import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { getGuildChannel } from '../lib/utils/guild/getGuildChannel';
import { Base } from './Base';
import { Embed } from './Embed';
import { Guild } from './Guild';

@Entity()
export class Channel extends Base {
  @ManyToOne(() => Guild, (guild) => guild.channels)
  guild!: Guild;

  @OneToMany(() => Embed, (embed) => embed.channel)
  embeds?: Embed[];

  getChannel = (guild: DiscordGuild) => <TextChannel>getGuildChannel(this.id, guild);
}
