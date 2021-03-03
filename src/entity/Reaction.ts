import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Embed } from './Embed';
import { ReactionRole } from './ReactionRole';

@Entity()
export class Reaction extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column()
  name!: string;

  @OneToMany(() => ReactionRole, (role) => role.reaction, { cascade: true })
  roles!: ReactionRole[];

  @ManyToOne(() => Embed, (embed) => embed.reactions)
  embed!: Embed;
}
