import { Client, Guild as DiscordGuild } from 'discord.js';
import { Column, Entity, OneToMany } from 'typeorm';
import { getGuild } from '../lib/utils/guild/getGuild';
import { Base } from './Base';
import { Channel } from './Channel';
import { Embed } from './Embed';
import { Reaction } from './Reaction';
import { ReactionRole } from './ReactionRole';

@Entity()
export class Guild extends Base {
  @Column({ default: '+' })
  prefix!: string;

  @OneToMany(() => Channel, (channel) => channel.guild, { cascade: true })
  channels?: Channel[];

  @OneToMany(() => Embed, (embed) => embed.guild, { cascade: true })
  embeds?: Embed[];

  @OneToMany(() => Reaction, (reaction) => reaction.guild, { cascade: true })
  reactions?: Reaction[];

  @OneToMany(() => ReactionRole, (role) => role.guild, { cascade: true })
  roles?: ReactionRole[];

  getGuild = (client: Client) => <DiscordGuild>getGuild(this.id, client);
}
