import { Client, Guild } from 'discord.js';
import { Column, Entity, OneToMany } from 'typeorm';
import { Base, ChannelEntity, EmbedEntity, ReactionEntity, RoleEntity } from '.';
import { getGuild } from '../lib/utils/guild/guild';

@Entity({ name: 'guilds' })
export class GuildEntity extends Base {
  @Column({ default: '+' })
  prefix!: string;

  @OneToMany(() => ChannelEntity, (channel) => channel.guild, { onUpdate: 'CASCADE' })
  channels!: ChannelEntity[];

  @OneToMany(() => EmbedEntity, (embed) => embed.guild, { onUpdate: 'CASCADE' })
  embeds!: EmbedEntity[];

  @OneToMany(() => ReactionEntity, (reaction) => reaction.guild, { onUpdate: 'CASCADE' })
  reactions!: ReactionEntity[];

  @OneToMany(() => RoleEntity, (role) => role.guild, { onUpdate: 'CASCADE' })
  roles!: RoleEntity[];

  getGuild = (client: Client) => <Guild>getGuild(this.id, client);
}
