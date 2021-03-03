import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Guild } from './Guild';
import { Reaction } from './Reaction';

@Entity()
export class ReactionRole extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column()
  name!: string;

  @ManyToOne(() => Guild, (guild) => guild.roles, { cascade: ['insert', 'update'] })
  guild!: Guild;

  @Column({ default: false })
  enabled!: boolean;

  @ManyToOne(() => Reaction, (reaction) => reaction.roles, { cascade: ['insert', 'update'] })
  reaction!: Reaction;
}
