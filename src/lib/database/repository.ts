import { Connection, ObjectLiteral, Repository } from 'typeorm';
import { ChannelEntity, EmbedEntity, GuildEntity, ReactionEntity, RoleEntity } from '../../entity';
import { Entities } from '../common/enums';

export function getRepository(conn: Connection, entity: string) {
  switch (entity) {
    case Entities.Channel:
      return conn.getRepository(ChannelEntity);
    case Entities.Embed:
      return conn.getRepository(EmbedEntity);
    case Entities.Guild:
      return conn.getRepository(GuildEntity);
    case Entities.Reaction:
      return conn.getRepository(ReactionEntity);
    case Entities.Role:
      return conn.getRepository(RoleEntity);
    default:
      return null;
  }
}

export function isChannelRepo(repo: Repository<ObjectLiteral>): repo is Repository<ChannelEntity> {
  return repo.target == ChannelEntity;
}

export function isEmbedRepo(repo: Repository<ObjectLiteral>): repo is Repository<EmbedEntity> {
  return repo.target == EmbedEntity;
}

export function isGuildRepo(repo: Repository<ObjectLiteral>): repo is Repository<GuildEntity> {
  return repo.target == GuildEntity;
}

export function isReactionRepo(repo: Repository<ObjectLiteral>): repo is Repository<ReactionEntity> {
  return repo.target == ReactionEntity;
}

export function isRoleRepo(repo: Repository<ObjectLiteral>): repo is Repository<RoleEntity> {
  return repo.target == RoleEntity;
}
