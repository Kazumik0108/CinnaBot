import { BaseEntity, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Channel } from './Channel';
import { Guild } from './Guild';
import { Reaction } from './Reaction';
import { ReactionRole } from './ReactionRole';

@Entity()
export class Embed extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column()
  title!: string;

  @ManyToOne(() => Guild, (guild) => guild.embeds)
  guild!: Guild;

  @ManyToOne(() => Channel, (channel) => channel.embeds)
  channel!: Channel;

  @Column('json', { default: null })
  embed!: unknown;

  @ManyToMany(() => Reaction, (reaction) => reaction.embeds, { cascade: true })
  reactions!: Reaction[];

  @OneToMany(() => ReactionRole, (role) => role.embed, { cascade: true })
  roles!: ReactionRole[];

  getEmbed = () => this.embed;

  getValue = () => `${this.title} | ${this.channel.name}`;
}
