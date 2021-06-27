import { CommandoGuild, CommandoMessage } from 'discord.js-commando';
import { ConnectionClient, ConnectionCommand } from '../../lib/common/classes';
import { createGuildView } from '../../lib/database/view';

export default class viewGuild extends ConnectionCommand {
  constructor(client: ConnectionClient) {
    super(client, {
      name: 'viewguild',
      aliases: ['viewg', 'vg'],
      memberName: 'viewguild',
      group: 'database',
      description:
        'View the database entries for the guild. The bot owner may also specify any guild from the database.',
    });
  }

  async run(message: CommandoMessage) {
    const conn = this.client.conn;
    const guild = this.client.owners.includes(message.author)
      ? (await getGuildFromOwner(message)) ?? message.guild
      : message.guild;

    const embed = await createGuildView(conn, guild);
    if (embed == null) {
      message.reply(`There was an error selecting ${message.guild} from the database ...`);
      return null;
    }

    message.embed(embed);
    return null;
  }
}

async function getGuildFromOwner(message: CommandoMessage) {
  const guilds = message.client.guilds.cache.array();

  let list = '';
  guilds.forEach((g, i) => {
    list = list.concat(`${i}\t${g.name}\n`);
  });

  await message.say('Select a guild to view, or `cancel` to end the command.\n```\n' + list + '\n```');
  const collected = await message.channel.awaitMessages((m: CommandoMessage) => filter(message, m), {
    max: 1,
    time: 10 * 1000,
  });

  const m = collected.first();
  if (m == undefined) return message.guild;
  if (m.content.toLowerCase() == 'cancel') return null;

  const index = parseInt(m.content);
  return guilds[index] as CommandoGuild;
}

function filter(message: CommandoMessage, m: CommandoMessage) {
  if (m.author != message.author) return false;
  if (m.content.toLowerCase() == 'cancel') return true;

  const match = m.content.match(/^[0-9|]+$/);
  if (match == null) return false;

  const num = parseFloat(match[0]);
  return num >= 0 && num < message.client.guilds.cache.size ? true : false;
}
