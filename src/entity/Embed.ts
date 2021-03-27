import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Channel } from './Channel';
import { Reaction } from './Reaction';
import { ReactionRole } from './ReactionRole';

@Entity()
export class Embed extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @ManyToOne(() => Channel, (channel) => channel.embed)
  channel!: Channel;

  @Column('json', { default: null })
  embed!: unknown;

  @OneToMany(() => Reaction, (reaction) => reaction.embed, { cascade: true })
  reactions?: Reaction[];

  @OneToMany(() => ReactionRole, (role) => role.embed, { cascade: true })
  roles?: ReactionRole[];
}
