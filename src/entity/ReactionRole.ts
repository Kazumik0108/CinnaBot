import { Column, ManyToOne } from 'typeorm';
import { Entity } from 'typeorm/decorator/entity/Entity';
import { Base } from './Base';
import { Guild } from './Guild';
import { Reaction } from './Reaction';

@Entity()
export class ReactionRole extends Base {
  @ManyToOne(() => Guild, (guild) => guild.roles, { cascade: ['insert', 'update'] })
  guild!: Guild;

  @Column({ default: false })
  enabled!: boolean;

  @ManyToOne(() => Reaction, (reaction) => reaction.roles, { cascade: ['insert', 'update'] })
  reaction!: Reaction;
}
