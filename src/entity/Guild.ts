import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Channel } from './Channel';
import { ReactionRole } from './ReactionRole';

@Entity({ name: 'guilds' })
export class Guild extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column()
  name!: string;

  @Column({ default: '+' })
  prefix!: string;

  @OneToMany(() => Channel, (channel) => channel.guild, { cascade: true })
  channels?: Channel[];

  @OneToMany(() => ReactionRole, (role) => role.guild, { cascade: true })
  roles?: ReactionRole[];
}
