import { Column, Entity, OneToMany } from 'typeorm';
import { Base } from './Base';
import { Channel } from './Channel';
import { ReactionRole } from './ReactionRole';

@Entity()
export class Guild extends Base {
  @Column()
  prefix!: string;

  @OneToMany(() => Channel, (channel) => channel.guild, { cascade: true })
  channels?: Channel[];

  @OneToMany(() => ReactionRole, (role) => role.guild, { cascade: true })
  roles?: ReactionRole[];
}
