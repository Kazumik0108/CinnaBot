import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { ChannelEntity, GuildEntity, ReactionEntity, RoleEntity } from '.';

@Entity({ name: 'embeds' })
export class EmbedEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column()
  title!: string;

  @ManyToOne(() => GuildEntity, (guild) => guild.embeds, { onDelete: 'CASCADE' })
  guild!: GuildEntity;

  @ManyToOne(() => ChannelEntity, (channel) => channel.embeds)
  channel!: ChannelEntity;

  @Column('json', { default: null })
  embed!: unknown;

  @ManyToMany(() => ReactionEntity, (reaction) => reaction.embeds)
  @JoinTable()
  reactions!: ReactionEntity[];

  @OneToMany(() => RoleEntity, (role) => role.embed, { onUpdate: 'CASCADE' })
  roles!: RoleEntity[];

  getEmbed = () => this.embed;

  getValue = () => `${this.title} | ${this.channel.name}`;
}
