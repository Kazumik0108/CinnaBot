import { GuildEmoji, Role, TextChannel } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { Connection } from 'typeorm';
import { Channel, Reaction, ReactionRole } from '../../entity';

const getEntityType = (entity: GuildEmoji | Role | TextChannel) => {
  if (entity instanceof GuildEmoji) return Reaction;
  if (entity instanceof Role) return ReactionRole;
  return Channel;
};

export const handleRegisterGuildEntity = async (
  message: CommandoMessage,
  entity: GuildEmoji | Role | TextChannel,
  name: string,
  conn: Connection,
) => {
  const Entity = getEntityType(entity);
  const query = await conn
    .createQueryBuilder()
    .select('e')
    .from(Entity, 'e')
    .where('e.id = :id', { id: entity.id })
    .getOne();

  if (query != undefined) {
    message.say(`The ${name} ${entity.name} has already been registered.`);
    return;
  }

  await conn.createQueryBuilder().insert().into(Entity).values({ id: entity.id, name: entity.name }).execute();
  await conn.createQueryBuilder().relation(Entity, 'guild').of(entity.id).set(message.guild.id);

  message.say(`The ${name} ${entity.name} has been registered into ${message.guild}.`);
};
