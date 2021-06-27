import { stripIndents } from 'common-tags';
import { GuildEmoji, Role, TextChannel } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { Connection } from 'typeorm';
import { ChannelEntity, ReactionEntity, RoleEntity } from '../../entity';
import { ConnectionClient, ConnectionCommand } from '../../lib/common/classes';
import { Entities } from '../../lib/common/enums';
import { bind } from '../../lib/database/bind';
import { registerChannel, registerGuild, registerReaction, registerRole } from '../../lib/database/register';
import { getRepository } from '../../lib/database/repository';
import { validateChannel, validateReaction, validateRole } from '../../lib/database/validate';
import { createGuildView } from '../../lib/database/view';
import { getGuildChannel } from '../../lib/utils/guild/channel';
import { getGuildEmoji } from '../../lib/utils/guild/emoji';
import { getGuildRole } from '../../lib/utils/guild/role';

const options = [Entities.Channel, Entities.Reaction, Entities.Role];
const prompt = stripIndents`
Specify the type of record to add: \`${options.join('`, `')}\`, followed by the name or id of the record.

Sending the channel mention or emoji is also valid. Multiple records of the same type can be entered at the same time.

For example: \`channel <#798740558943617025> 798740415692013599\` will add the text channels with ids \`798740558943617025\` and \`798740415692013599\`, if they exist in the guild.

Use \`stop\` to end the command.
`;
const timer = 20 * 1000;

export default class addRecord extends ConnectionCommand {
  constructor(client: ConnectionClient) {
    super(client, {
      name: 'addrecord',
      aliases: ['arecord', 'ar'],
      memberName: 'addrecord',
      group: 'database',
      description: "Add a guild, channel, reaction, or role record to the guild's database.",
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES'],
    });
  }

  async run(message: CommandoMessage) {
    const conn = this.client.conn;
    await registerGuild(conn, message.guild);

    const embed = await createGuildView(conn, message.guild);
    if (embed == null) return message.say(`There was an error creating a view for ${message.guild} ...`);

    const i = embed.fields.findIndex((f) => f.name == 'Embed Messages');
    embed.setDescription('**Add Records**').spliceFields(i, 1);
    const view = await message.reply(prompt, embed);

    const collector = message.channel.createMessageCollector((m: CommandoMessage) => filter(m, message, conn), {
      time: timer,
    });

    collector.on('collect', async (m: CommandoMessage) => {
      if (m.content.toLowerCase() == 'stop') {
        m.say('Ending the command ...');
        return collector.stop();
      }

      collector.resetTimer({ time: timer });

      const entity = m.content.substr(0, m.content.indexOf(' '));
      const records = (await parser(m, conn)) as (TextChannel | GuildEmoji | Role)[];

      const repo = getRepository(conn, entity as string);
      if (repo == null) return;

      const success: string[] = [];
      for (const record of records) {
        try {
          if (record instanceof TextChannel) {
            const exists = await validateChannel(conn, record);
            if (exists) continue;
            await registerChannel(conn, record);
            await bind(conn, { type: 'channel', args: { channel: record } });
            success.push(record.name);
          } else if (record instanceof GuildEmoji) {
            const exists = await validateReaction(conn, record);
            if (exists) continue;
            await registerReaction(conn, record);
            await bind(conn, { type: 'reaction', args: { reaction: record } });
            success.push(record.name);
          } else if (record instanceof Role) {
            const exists = await validateRole(conn, record);
            if (exists) continue;
            await registerRole(conn, record);
            await bind(conn, { type: 'role', args: { role: record } });
            success.push(record.name);
          }
        } catch (e) {
          await message.say(`There was an error adding ${record} to the database.`);
          console.log(`An error occurred adding a ${record.name} to the database:`, e);
        }
      }

      const edit = await createGuildView(conn, m.guild);
      if (edit == null) return message.say(`There was an error creating a view for ${message.guild} ...`);
      edit.setDescription('**Add Records**');
      await view.edit(edit);

      await message.say(`The following records were added to ${message.guild}:\n\`${success.join('`, `')}\``);
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
    switch (entity) {
      case Entities.Channel: {
        const channel = getGuildChannel(input, m.guild);
        if (channel instanceof TextChannel) records.push(channel);
        break;
      }
      case Entities.Reaction: {
        const reaction = getGuildEmoji(input, m.guild);
        if (reaction instanceof GuildEmoji) records.push(reaction);
        break;
      }
      case Entities.Role: {
        const role = getGuildRole(input, m.guild);
        if (role instanceof Role) records.push(role);
        break;
      }
    }
  }

  return records.filter(async (r) => {
    switch (r.constructor) {
      case TextChannel: {
        const channels = await conn
          .getRepository(ChannelEntity)
          .createQueryBuilder('c')
          .where('c.id = :id', { id: r.id })
          .andWhere('c.guildId = :guildId', { guildId: m.guild.id })
          .getMany();
        return !channels.some((c) => c.id == r.id);
      }
      case GuildEmoji: {
        const reactions = await conn
          .getRepository(ReactionEntity)
          .createQueryBuilder('react')
          .where('react.id = :id', { id: r.id })
          .andWhere('react.guildId = :guildId', { guildId: m.guild.id })
          .getMany();
        return !reactions.some((react) => react.id == r.id);
      }
      case Role: {
        const roles = await conn
          .getRepository(RoleEntity)
          .createQueryBuilder('role')
          .where('role.id = :id', { id: r.id })
          .andWhere('role.guildId = :guildId', { guildId: m.guild.id })
          .getMany();
        return !roles.some((role) => role.id == r.id);
      }
      default:
        return false;
    }
  });
}
