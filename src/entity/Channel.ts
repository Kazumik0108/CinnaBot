import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Embed } from './Embed';
import { Guild } from './Guild';

@Entity()
export class Channel extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column()
  name!: string;

  @ManyToOne(() => Guild, (guild) => guild.channels)
  guild!: Guild;

  @OneToMany(() => Embed, (embed) => embed.channel)
  embed?: Embed;
}
