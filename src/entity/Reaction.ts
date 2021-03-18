import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { Base } from './Base';
import { Embed } from './Embed';
import { ReactionRole } from './ReactionRole';

@Entity()
export class Reaction extends Base {
  @OneToMany(() => ReactionRole, (role) => role.reaction, { cascade: true })
  roles!: ReactionRole[];

  @ManyToOne(() => Embed, (embed) => embed.reactions)
  embed!: Embed;
}
