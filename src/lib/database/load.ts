import { Connection } from 'typeorm';
import { ChannelEntity, EmbedEntity, GuildEntity, ReactionEntity, RoleEntity } from '../../entity';
import { GuildRelations } from '../common/enums';
import { IgnoreRelation } from '../common/types';

export async function load(
  conn: Connection,
  record: ChannelEntity | EmbedEntity | GuildEntity | ReactionEntity | RoleEntity,
  ignore?: IgnoreRelation[],
) {
  const q = conn.createQueryBuilder();
  if (record instanceof GuildEntity) {
    if (!ignore?.includes(GuildRelations.channel) && q.hasRelation(GuildEntity, 'channels')) {
      record.channels = await q.relation(GuildEntity, 'channels').of(record.id).loadMany();
    }
    if (ignore?.includes(GuildRelations.embed) && q.hasRelation(GuildEntity, 'embeds')) {
      record.embeds = await q.relation(GuildEntity, 'embeds').of(record.id).loadMany();
    }
    if (!ignore?.includes(GuildRelations.reaction) && q.hasRelation(GuildEntity, 'reactions')) {
      record.reactions = await q.relation(GuildEntity, 'reactions').of(record.id).loadMany();
    }
    if (!ignore?.includes(GuildRelations.role) && q.hasRelation(GuildEntity, 'roles')) {
      record.roles = await q.relation(GuildEntity, 'roles').of(record.id).loadMany();
    }
  } else if (record instanceof ReactionEntity) {
    if (!ignore?.includes(GuildRelations.embed) && q.hasRelation(ReactionEntity, 'embeds')) {
      record.embeds = await q.relation(ReactionEntity, 'embeds').of(record.id).loadMany();
    }
    if (!ignore?.includes(GuildRelations.role) && q.hasRelation(ReactionEntity, 'roles')) {
      record.roles = await q.relation(ReactionEntity, 'roles').of(record.id).loadMany();
    }
  }
}
