import { Guild as DiscordGuild, GuildEmoji } from 'discord.js';
import { Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { getGuildEmoji } from '../lib/utils/guild/getGuildEmoji';
import { Base } from './Base';
import { Embed } from './Embed';
import { Guild } from './Guild';
import { ReactionRole } from './ReactionRole';

@Entity()
export class Reaction extends Base {
  @ManyToOne(() => Guild, (guild) => guild.reactions)
  guild!: Guild;

  @ManyToMany(() => Embed, (embed) => embed.reactions)
  embeds?: Embed[];

  @OneToMany(() => ReactionRole, (role) => role.reaction, { cascade: true })
  roles?: ReactionRole[];

  getReaction = (guild: DiscordGuild) => <GuildEmoji>getGuildEmoji(this.id, guild);

  getValue = (guild: DiscordGuild) => `${this.getReaction(guild)} | ${this.id}`;
}
