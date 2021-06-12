import { BaseEntity, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChannelEntity, GuildEntity, ReactionEntity, RoleEntity } from '.';

@Entity({ name: 'embeds' })
export class EmbedEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column()
  title!: string;

  @ManyToOne(() => GuildEntity, (guild) => guild.embeds)
  guild!: GuildEntity;

  @ManyToOne(() => ChannelEntity, (channel) => channel.embeds)
  channel!: ChannelEntity;

  @Column('json', { default: null })
  embed!: unknown;

  @ManyToMany(() => ReactionEntity, (reaction) => reaction.embeds)
  reactions!: ReactionEntity[];

  @OneToMany(() => RoleEntity, (role) => role.embed, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  roles!: RoleEntity[];

  getEmbed = () => this.embed;

  getValue = () => `${this.title} | ${this.channel.name}`;
}
