import { Guild, Role } from 'discord.js';
import { Column, ManyToOne } from 'typeorm';
import { Entity } from 'typeorm/decorator/entity/Entity';
import { Base, EmbedEntity, GuildEntity, ReactionEntity } from '.';
import { getGuildRole } from '../lib/utils/guild/role';

@Entity({ name: 'roles' })
export class RoleEntity extends Base {
  @ManyToOne(() => GuildEntity, (guild) => guild.roles)
  guild!: GuildEntity;

  @Column({ default: false })
  enabled!: boolean;

  @ManyToOne(() => EmbedEntity, (embed) => embed.roles)
  embed!: EmbedEntity;

  @ManyToOne(() => ReactionEntity, (reaction) => reaction.roles)
  reaction!: ReactionEntity;

  getRole = (guild: Guild) => <Role>getGuildRole(this.id, guild);
}
