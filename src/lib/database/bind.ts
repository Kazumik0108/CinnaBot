import { MessageEmbed, Role, TextChannel } from 'discord.js';
import { Connection } from 'typeorm';
import { ChannelEntity, EmbedEntity, ReactionEntity, RoleEntity } from '../../entity';
import { Entities } from '../common/enums';
import { BindChannel, BindEmbed, BindReaction, BindRole } from '../common/interfaces';
import { getRepository, isChannelRepo, isEmbedRepo, isReactionRepo, isRoleRepo } from './repository';
import { selectOneByName } from './select';

export async function bind(conn: Connection, o: BindChannel | BindEmbed | BindReaction | BindRole) {
  if (isBindChannel(o)) {
    const { channel } = { ...o.args };
    const repo = getRepository(conn, Entities.Channel);
    if (repo != null && isChannelRepo(repo)) {
      const q = repo.createQueryBuilder();
      await q.relation(ChannelEntity, 'guild').of(channel.id).set(channel.guild.id);
    }
  } else if (isBindEmbed(o)) {
    const { uuid, guild, channel } = { ...o.args };
    const repo = getRepository(conn, Entities.Embed);
    if (repo != null && isEmbedRepo(repo)) {
      const q = repo.createQueryBuilder();
      await q.relation(EmbedEntity, 'guild').of(uuid).set(guild.id);
      if (channel instanceof TextChannel) await q.relation(EmbedEntity, 'channel').of(uuid).set(channel.id);
    }
  } else if (isBindReaction(o)) {
    const { reaction, role, embed } = { ...o.args };
    const repo = getRepository(conn, Entities.Reaction);
    if (repo != null && isReactionRepo(repo)) {
      const q = repo.createQueryBuilder();
      await q.relation(ReactionEntity, 'guild').of(reaction.id).set(reaction.guild.id);
      if (role instanceof Role) await q.relation(ReactionEntity, 'role').of(reaction.id).set(role.id);
      if (embed instanceof MessageEmbed) {
        const query = await selectOneByName(conn, reaction.guild, Entities.Embed, embed.title as string);
        if (query instanceof EmbedEntity) await q.relation(ReactionEntity, 'embed').of(reaction.id).set(query.uuid);
      }
    }
  } else if (isBindRole(o)) {
    const { role, embed } = { ...o.args };
    const repo = getRepository(conn, Entities.Role);
    if (repo != null && isRoleRepo(repo)) {
      const q = repo.createQueryBuilder();
      await q.relation(RoleEntity, 'guild').of(role.id).set(role.guild.id);
      if (embed instanceof MessageEmbed) {
        const query = await selectOneByName(conn, role.guild, Entities.Embed, embed.title as string);
        if (query instanceof EmbedEntity) await q.relation(RoleEntity, 'embed').of(role.id).set(query.uuid);
      }
    }
  }
}

export function isBindChannel(o: BindChannel | BindEmbed | BindReaction | BindRole): o is BindChannel {
  return o.type == 'channel';
}

export function isBindEmbed(o: BindChannel | BindEmbed | BindReaction | BindRole): o is BindEmbed {
  return o.type == 'embed';
}

export function isBindReaction(o: BindChannel | BindEmbed | BindReaction | BindRole): o is BindReaction {
  return o.type == 'reaction';
}

export function isBindRole(o: BindChannel | BindEmbed | BindReaction | BindRole): o is BindRole {
  return o.type == 'role';
}
