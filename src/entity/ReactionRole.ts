import 'reflect-metadata';
import { Column, ManyToOne } from 'typeorm';
import { Entity } from 'typeorm/decorator/entity/Entity';
import { Base } from './Base';
import { Embed } from './Embed';
import { Guild } from './Guild';
import { Reaction } from './Reaction';

@Entity()
export class ReactionRole extends Base {
  @ManyToOne(() => Guild, (guild) => guild.roles, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  guild!: Guild;

  @Column({ default: false })
  enabled!: boolean;

  @ManyToOne(() => Embed, (embed) => embed.roles)
  embed!: Embed;

  @ManyToOne(() => Reaction, (reaction) => reaction.roles)
  reaction!: Reaction;
}
