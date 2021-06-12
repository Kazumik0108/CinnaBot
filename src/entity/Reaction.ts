import { Guild, GuildEmoji } from 'discord.js';
import { Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Base, EmbedEntity, GuildEntity, RoleEntity } from '.';
import { getGuildEmoji } from '../lib/utils/guild/emoji';

@Entity({ name: 'reactions' })
export class ReactionEntity extends Base {
  @ManyToOne(() => GuildEntity, (guild) => guild.reactions)
  guild!: GuildEntity;

  @ManyToMany(() => EmbedEntity, (embed) => embed.reactions)
  embeds!: EmbedEntity[];

  @OneToMany(() => RoleEntity, (role) => role.reaction, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  roles!: RoleEntity[];

  getReaction = (guild: Guild) => <GuildEmoji>getGuildEmoji(this.id, guild);
}
