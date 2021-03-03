import { BaseEntity, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Channel } from './Channel';
import { Reaction } from './Reaction';

@Entity()
export class Embed extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  title!: string;

  @ManyToOne(() => Channel, (channel) => channel.embed)
  channel!: Channel;

  @OneToMany(() => Reaction, (reaction) => reaction.embed, { cascade: true })
  reactions!: Reaction[];
}
