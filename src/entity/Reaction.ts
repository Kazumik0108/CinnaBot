import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Embed } from './Embed';
import { ReactionRole } from './ReactionRole';

@Entity()
export class Reaction extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column()
  id!: string;

  @Column()
  name!: string;

  @ManyToOne(() => Embed, (embed) => embed.reactions)
  embed!: Embed;

  @OneToMany(() => ReactionRole, (role) => role.reaction, { cascade: true })
  roles?: ReactionRole[];
}
