import * as typeorm from 'typeorm';
import { ChannelEntity, GuildEntity, ReactionEntity, RoleEntity } from '.';

@typeorm.Entity({ name: 'embeds' })
export class EmbedEntity extends typeorm.BaseEntity {
  @typeorm.PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @typeorm.Column()
  title!: string;

  @typeorm.ManyToOne(() => GuildEntity, (guild) => guild.embeds, { onDelete: 'CASCADE' })
  guild!: GuildEntity;

  @typeorm.ManyToOne(() => ChannelEntity, (channel) => channel.embeds, { onUpdate: 'CASCADE' })
  channel!: ChannelEntity;

  @typeorm.Column('json', { default: null })
  embed!: unknown;

  @typeorm.ManyToMany(() => ReactionEntity, (reaction) => reaction.embeds)
  @typeorm.JoinTable()
  reactions!: ReactionEntity[];

  @typeorm.OneToMany(() => RoleEntity, (role) => role.embed, { onUpdate: 'CASCADE' })
  roles!: RoleEntity[];

  getEmbed = () => this.embed;

  getValue = () => `${this.title} | ${this.channel.name}`;
}
