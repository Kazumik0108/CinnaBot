import { Guild, GuildEmoji } from 'discord.js';
import { Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Base, EmbedEntity, GuildEntity, RoleEntity } from '.';
import { getGuildEmoji } from '../lib/utils/guild/emoji';

@Entity({ name: 'reactions' })
export class ReactionEntity extends Base {
  @ManyToOne(() => GuildEntity, (guild) => guild.reactions, { onDelete: 'CASCADE' })
  guild!: GuildEntity;

  @ManyToMany(() => EmbedEntity, (embed) => embed.reactions)
  @JoinTable()
  embeds!: EmbedEntity[];

  @OneToMany(() => RoleEntity, (role) => role.reaction, { onUpdate: 'CASCADE' })
  roles!: RoleEntity[];

  getReaction = (guild: Guild) => <GuildEmoji>getGuildEmoji(this.id, guild);
}
