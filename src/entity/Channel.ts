import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { Base } from './Base';
import { Embed } from './Embed';
import { Guild } from './Guild';

@Entity()
export class Channel extends Base {
  @ManyToOne(() => Guild, (guild) => guild.channels)
  guild!: Guild;

  @OneToMany(() => Embed, (embed) => embed.channel)
  embed?: Embed;
}
