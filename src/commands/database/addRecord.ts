import { GuildEmoji, Role, TextChannel } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { ChannelEntity, GuildEntity, ReactionEntity, RoleEntity } from '../../entity';
import { ConnectionClient, ConnectionCommand } from '../../lib/common/classes';
import { Entities } from '../../lib/common/enums';
import { CHANNEL_ID, EMOJI_ID, ROLE_ID } from '../../lib/common/regex';
import { registerOne } from '../../lib/database/register';
import { registerGuildOnValidate } from '../../lib/database/registerOnValidate';
import { validate } from '../../lib/database/validate';
import { getGuildChannel, isGuildChannel, isTextChannel } from '../../lib/utils/guild/channel';
import { getGuildEmoji, isEmoji, isGuildEmoji } from '../../lib/utils/guild/emoji';
import { getGuildRole, isGuildRole, isRole } from '../../lib/utils/guild/role';

interface PromptArgs {
  entity: string;
}

const entities = [Entities.Channel, Entities.Reaction, Entities.Role];

export default class addRecord extends ConnectionCommand {
  constructor(client: ConnectionClient) {
    super(client, {
      name: 'addrecord',
      aliases: ['arecord', 'ar'],
      memberName: 'ar',
      group: 'database',
      description: 'Add a record to the database.',
      guildOnly: true,
      args: [
        {
          key: 'entity',
          prompt: `Specify the record type to add: \`${entities.join('`, `')}\``,
          type: 'string',
          oneOf: entities,
        },
      ],
    });
  }

  async run(message: CommandoMessage, { entity }: PromptArgs) {
    const conn = this.client.conn;
    const guildExists = await validate(conn, message.guild, Entities.Guild);
    if (!guildExists) registerGuildOnValidate(conn, message, message.guild);

    const recordType = entity == Entities.Channel ? 'text channel' : entity == Entities.Reaction ? 'emoji' : 'role';
    const parser = entity == Entities.Channel ? parseChannel : entity == Entities.Reaction ? parseEmoji : parseRole;

    await message.reply(
      `Specify the name or id of the ${recordType} from this server to add, or enter \`cancel\` to end the command.`,
    );
    const collector = message.channel.createMessageCollector((m: CommandoMessage) => filter(m, message, entity), {
      max: 1,
      time: 10 * 1000,
    });

    collector.on('collect', async (m: CommandoMessage) => {
      if (m.content.toLowerCase() == 'cancel') {
        await message.say('Cancelling the command ...');
        return;
      }

      const object = await parser(m);
      if (object == null) return;

      const exists = await validate(conn, message.guild, entity, object.id);
      if (exists) return await message.say(`${object} is already registered to this guild. Try the command again ...`);
      try {
        if (isTextChannel(object)) {
          await registerOne({ conn: conn, guild: message.guild, entity: entity, channel: object });
          await conn.createQueryBuilder().relation(ChannelEntity, 'guild').of(object.id).set(object.guild.id);
          await conn.createQueryBuilder().relation(GuildEntity, 'channels').of(object.guild.id).add(object.id);
          await message.say(`${object} was successfully registered!`);
        }
        if (isEmoji(object)) {
          await registerOne({ conn: conn, guild: message.guild, entity: entity, reaction: object });
          await conn.createQueryBuilder().relation(ReactionEntity, 'guild').of(object.id).set(object.guild.id);
          await conn.createQueryBuilder().relation(GuildEntity, 'embeds').of(object.guild.id).add(object.id);
          await message.say(`${object} was successfully registered!`);
        }
        if (isRole(object)) {
          await registerOne({ conn: conn, guild: message.guild, entity: entity, role: object });
          await conn.createQueryBuilder().relation(RoleEntity, 'guild').of(object.id).set(object.guild.id);
          await conn.createQueryBuilder().relation(GuildEntity, 'embeds').of(object.guild.id).add(object.id);
          await message.say(`${object} was successfully registered!`);
        }
      } catch (e) {
        message.say(`There was an error adding ${object} to the database.`);
        console.log(`An error occurred adding a ${recordType} to the database:`, e);
      }
      return;
    });
    return null;
  }
}

async function filter(m: CommandoMessage, message: CommandoMessage, entity: string) {
  if (m.author != message.author) return false;
  if (m.content.toLowerCase() == 'cancel') return true;

  switch (entity) {
    case Entities.Channel: {
      const channel = await parseChannel(m);
      return channel instanceof TextChannel && isGuildChannel(channel, message.guild) ? true : false;
    }
    case Entities.Reaction: {
      const emoji = await parseEmoji(m);
      return emoji instanceof GuildEmoji && isGuildEmoji(emoji, message.guild) ? true : false;
    }
    default: {
      const role = await parseRole(m);
      return role instanceof Role && isGuildRole(role, message.guild) ? true : false;
    }
  }
}

async function parseChannel(m: CommandoMessage) {
  const id = CHANNEL_ID.test(m.content) ? (m.content.match(CHANNEL_ID) as string[])[0] : null;
  const channel = id != null ? getGuildChannel(id, m.guild) : getGuildChannel(m.content, m.guild);
  if (channel == null) {
    await m.reply('This text channel does not exist in this server.');
    return null;
  }

  if (!isTextChannel(channel)) {
    await m.reply('Only text channels can be added.');
    return null;
  }
  return channel;
}

async function parseEmoji(m: CommandoMessage) {
  const id = EMOJI_ID.test(m.content) ? (m.content.match(EMOJI_ID) as string[])[0] : null;
  const emoji = id != null ? getGuildEmoji(id, m.guild) : getGuildEmoji(m.content, m.guild);
  if (emoji == null) {
    await m.reply('This emoji does not exist in this server.');
    return null;
  }
  return emoji;
}

async function parseRole(m: CommandoMessage) {
  const id = ROLE_ID.test(m.content) ? (m.content.match(ROLE_ID) as string[])[0] : null;
  const role = id != null ? getGuildRole(id, m.guild) : getGuildRole(m.content, m.guild);
  if (role == null) {
    await m.reply('This role does not exist in this server.');
    return null;
  }
  return role;
}
