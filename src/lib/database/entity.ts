import { BaseEntity } from 'typeorm';
import { ChannelEntity, EmbedEntity, GuildEntity, ReactionEntity, RoleEntity } from '../../entity';

export function isChannelEntity(entity: BaseEntity): entity is ChannelEntity {
  return entity instanceof ChannelEntity;
}

export function isEmbedEntity(entity: BaseEntity): entity is EmbedEntity {
  return entity instanceof EmbedEntity;
}

export function isGuildEntity(entity: BaseEntity): entity is GuildEntity {
  return entity instanceof GuildEntity;
}

export function isReactionEntity(entity: BaseEntity): entity is ReactionEntity {
  return entity instanceof ReactionEntity;
}

export function isRoleEntity(entity: BaseEntity): entity is RoleEntity {
  return entity instanceof RoleEntity;
}
