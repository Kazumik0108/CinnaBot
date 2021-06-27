import { stripIndents } from 'common-tags';
import { CommandoMessage } from 'discord.js-commando';
import { GuildEntity } from '../../entity';
import { ConnectionClient, ConnectionCommand } from '../../lib/common/classes';
import { Entities, GuildRelations } from '../../lib/common/enums';
import { EMOJI_ID, ROLE_ID } from '../../lib/common/regex';
import { isEmbedEntity, isReactionEntity, isRoleEntity } from '../../lib/database/entity';
import { load } from '../../lib/database/load';
import { registerGuild } from '../../lib/database/register';
import { selectOneByID } from '../../lib/database/select';
import { createGuildView } from '../../lib/database/view';
import { hasRecords } from '../../lib/utils/database/records';

const options = Object.values(Entities).filter((o) => o != Entities.Guild && o != Entities.Channel);
const ignoreRelations = [GuildRelations.channel];
const timer = 20 * 1000;

export default class editRecord extends ConnectionCommand {
  constructor(client: ConnectionClient) {
    super(client, {
      name: 'editrecord',
      aliases: ['erecord', 'er'],
      memberName: 'editrecord',
      group: 'database',
      description: "Edit a record in the guild's database.",
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES'],
    });
  }

  async run(message: CommandoMessage) {
    const conn = this.client.conn;
    await registerGuild(conn, message.guild);

    const guild = (await selectOneByID(conn, message.guild, Entities.Guild)) as GuildEntity | undefined;
    if (guild == undefined) return null;

    await load(conn, guild, ignoreRelations);
    if (!(await hasRecords(guild))) return message.say('There are no valid records to edit from this guild..');

    const embed = await createGuildView(conn, message.guild, {
      description: '**__Edit Records__**',
      ignore: ignoreRelations,
    });
    if (embed == null) return message.say(`There was an error creating a view for ${message.guild} ...`);

    const prompt = stripIndents`
    Specify the type of record to edit: \`${options.join(
      '`, `',
    )}\`, followed by the name or id of the record. Sending the channel mention or emoji is also valid.

    Use \`stop\` to end the command.
    `;
    await message.reply(prompt, embed);

    const collector = message.channel.createMessageCollector((m: CommandoMessage) => filter(m, message, guild), {
      time: timer,
    });

    collector.on('collect', async (m: CommandoMessage) => {
      if (m.content.toLowerCase() == 'stop') {
        m.say('Ending the command ...');
        return collector.stop();
      }

      collector.resetTimer({ time: timer });
      const record = await parser(m, guild);
      if (record == undefined) return;

      await load(conn, record);
      if (isEmbedEntity(record)) {
        console.log(record);
      } else if (isReactionEntity(record)) {
        console.log(record);
      } else if (isRoleEntity(record)) {
        console.log(record);
      }
      return;
    });

    return null;
  }
}

async function filter(m: CommandoMessage, message: CommandoMessage, guild: GuildEntity) {
  if (m.author != message.author) return false;
  if (m.content.toLowerCase() == 'stop') return true;
  const record = await parser(m, guild);
  return record != undefined ? true : false;
}

async function parser(m: CommandoMessage, guild: GuildEntity) {
  const entity = m.content.substr(0, m.content.indexOf(' '));
  const input = m.content.substr(m.content.indexOf(' ') + 1);

  if (entity == '') {
    m.say('No argument was provided ...');
    return undefined;
  }

  if (!options.some((o) => o == entity)) {
    m.say('Invalid record type was provided');
    return undefined;
  }

  switch (entity) {
    case Entities.Embed:
      return guild.embeds.find((e) => e.title == input);
    case Entities.Reaction: {
      const property = EMOJI_ID.test(input) ? (input.match(EMOJI_ID) as string[])[0] : input;
      return guild.reactions.find((r) => r.id == property || r.name == property);
    }
    case Entities.Role: {
      const property = ROLE_ID.test(input) ? (input.match(ROLE_ID) as string[])[0] : input;
      return guild.roles.find((r) => r.id == property || r.name == property);
    }
  }
  return undefined;
}
