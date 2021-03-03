import { GuildEmoji } from 'discord.js';
import { Connection } from 'typeorm';
import { Reaction } from '../../entity/Reaction';
import { ReactionRole } from '../../entity/ReactionRole';

export const createReactionEntity = async (react: GuildEmoji, conn: Connection, rrole: ReactionRole) => {
  await conn
    .createQueryBuilder()
    .insert()
    .into(Reaction)
    .values([
      {
        id: react.id,
        name: react.name,
      },
    ])
    .execute();
  await conn.createQueryBuilder().relation(ReactionRole, 'reaction').of(rrole.id).set(react.id);
};

export const handleReactionQuery = async (react: GuildEmoji, conn: Connection, rrole: ReactionRole) => {
  let reaction = await conn
    .getRepository(Reaction)
    .createQueryBuilder('r')
    .where('r.id =:id', { id: react.id })
    .getOne();
  if (!reaction) await createReactionEntity(react, conn, rrole);
  reaction = await conn.getRepository(Reaction).createQueryBuilder('r').where('r.id =:id', { id: react.id }).getOne();
  return reaction as Reaction;
};
