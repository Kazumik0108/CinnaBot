import { stripIndents } from 'common-tags';
import { GuildEmoji, Role, TextChannel } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { Connection } from 'typeorm';
import { ChannelEntity, GuildEntity, ReactionEntity, RoleEntity } from '../../entity';
import { ConnectionClient, ConnectionCommand } from '../../lib/common/classes';
import { Entities } from '../../lib/common/enums';
import { getRepository } from '../../lib/database/getRepository';
import { registerOne } from '../../lib/database/register';
import { validateByID } from '../../lib/database/validate';
import { guildView } from '../../lib/database/view';
import { getGuildChannel, isTextChannel } from '../../lib/utils/guild/channel';
import { getGuildEmoji, isEmoji } from '../../lib/utils/guild/emoji';
import { getGuildRole, isRole } from '../../lib/utils/guild/role';

const options = [Entities.Channel, Entities.Reaction, Entities.Role];

export default class addRecord extends ConnectionCommand {
  constructor(client: ConnectionClient) {
    super(client, {
      name: 'addrecord',
      aliases: ['arecord', 'ar'],
      memberName: 'ar',
      group: 'database',
      description: "Add a guild, channel, reaction, or role record to the guild's database.",
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES'],
    });
  }

  async run(message: CommandoMessage) {
    const conn = this.client.conn;

    const exists = await validateByID(conn, message.guild, Entities.Guild);
    if (!exists) {
      try {
        await registerOne({ conn: conn, guild: message.guild, entity: Entities.Guild });
      } catch (e) {
        await message.say(`${message.guild} does not exist in the database and here was an error adding it.`);
        console.error('An error occurred adding a guild to the database:', e);
        return null;
      }
    }

    const embed = await guildView(conn, message.guild);
    if (embed == null) {
      message.say(`There was an error creating a view for ${message.guild} ...`);
      return null;
    }
    embed.setDescription('**Add Records**');

    const prompt = stripIndents`
    Specify the type of record to add: \`${options.join('`, `')}\`, followed by the name or id of the record.
    Sending the channel mention or emoji is also valid. Multiple records of the same type can be entered at the same time.

    For example: \`channel <#798740558943617025> 798740415692013599\` will add the text channels with ids \`798740558943617025\` and \`798740415692013599\`, if they exist in the guild.

    Use \`stop\` to end the command.
    `;
    const view = await message.reply(prompt, embed);

    const collector = message.channel.createMessageCollector((m: CommandoMessage) => filter(m, message, conn), {
      time: 20 * 1000,
    });

    collector.on('collect', async (m: CommandoMessage) => {
      if (m.content.toLowerCase() == 'stop') {
        m.say('Ending the command ...');
        return collector.stop();
      }

      collector.resetTimer({ time: 20 * 1000 });

      const entity = m.content.substr(0, m.content.indexOf(' '));
      const records = (await parser(m, conn)) as (TextChannel | GuildEmoji | Role)[];

      const repo = getRepository(conn, entity as string);
      if (repo == null) return;

      for (const record of records) {
        try {
          if (isTextChannel(record)) {
            await registerOne({ conn: conn, guild: message.guild, entity: entity, channel: record });
            await conn.createQueryBuilder().relation(ChannelEntity, 'guild').of(record.id).set(record.guild.id);
            await conn.createQueryBuilder().relation(GuildEntity, 'channels').of(record.guild.id).add(record.id);
          }
          if (isEmoji(record)) {
            await registerOne({ conn: conn, guild: message.guild, entity: entity, reaction: record });
            await conn.createQueryBuilder().relation(ReactionEntity, 'guild').of(record.id).set(record.guild.id);
            await conn.createQueryBuilder().relation(GuildEntity, 'embeds').of(record.guild.id).add(record.id);
          }
          if (isRole(record)) {
            await registerOne({ conn: conn, guild: message.guild, entity: entity, role: record });
            await conn.createQueryBuilder().relation(RoleEntity, 'guild').of(record.id).set(record.guild.id);
            await conn.createQueryBuilder().relation(GuildEntity, 'embeds').of(record.guild.id).add(record.id);
          }
        } catch (e) {
          message.say(`There was an error adding ${record} to the database.`);
          console.log(`An error occurred adding a ${record.name} to the database:`, e);
        }
      }
      const edit = await guildView(conn, m.guild);
      if (edit == null) {
        return message.say(`There was an error creating a view for ${message.guild} ...`);
      }
      edit.setDescription('**Add Records**');
      await view.edit(edit);

      await message.say('Continue adding other records or enter `stop` to end the command.');
    });

    return null;
  }
}

async function filter(m: CommandoMessage, message: CommandoMessage, conn: Connection) {
  if (m.author != message.author) return false;
  if (m.content.toLowerCase() == 'stop') return true;
  const records = await parser(m, conn);
  return records == null || records.length == 0 ? false : true;
}

async function parser(m: CommandoMessage, conn: Connection) {
  const entity = m.content.substr(0, m.content.indexOf(' '));
  const inputs = m.content.substr(m.content.indexOf(' ') + 1).split(/ +/);

  if (entity == '') {
    m.say('No argument was provided ...');
    return null;
  }

  if (!options.some((o) => o == entity)) {
    m.say('Invalid record type was provided.');
    return null;
  }

  const records = [];
  for (const input of inputs) {
    if (entity == Entities.Channel) {
      const channel = getGuildChannel(input, m.guild);
      if (isTextChannel(channel)) records.push(channel);
    } else if (entity == Entities.Reaction) {
      const reaction = getGuildEmoji(input, m.guild);
      console.log(input, reaction);
      if (reaction != null) records.push(reaction);
    } else if (entity == Entities.Role) {
      const role = getGuildRole(input, m.guild);
      if (role != null) records.push(role);
    }
  }

  return records.filter(async (r) => {
    if (r instanceof TextChannel) {
      const channels = await conn
        .getRepository(ChannelEntity)
        .createQueryBuilder('c')
        .where('c.id = :id', { id: r.id })
        .andWhere('c.guildId = :guildId', { guildId: m.guild.id })
        .getMany();
      return !channels.some((c) => c.id == r.id);
    } else if (r instanceof GuildEmoji) {
      const reactions = await conn
        .getRepository(ReactionEntity)
        .createQueryBuilder('react')
        .where('react.id = :id', { id: r.id })
        .andWhere('react.guildId = :guildId', { guildId: m.guild.id })
        .getMany();
      return !reactions.some((react) => react.id == r.id);
    } else {
      const roles = await conn
        .getRepository(RoleEntity)
        .createQueryBuilder('role')
        .where('role.id = :id', { id: r.id })
        .andWhere('role.guildId = :guildId', { guildId: m.guild.id })
        .getMany();
      return !roles.some((role) => role.id == r.id);
    }
  });
}
