import { stripIndents } from 'common-tags';
import { MessageEmbed, MessageReaction, User } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { Connection } from 'typeorm';
import { Base, ChannelEntity, EmbedEntity, GuildEntity, ReactionEntity, RoleEntity } from '../../entity';
import { ConnectionClient, ConnectionCommand } from '../../lib/common/classes';
import { Entities } from '../../lib/common/enums';
import { ReactionOptionsYesNo } from '../../lib/common/interfaces';
import { CHANNEL_ID, EMOJI_ID, ROLE_ID } from '../../lib/common/regex';
import {
  getRepository,
  isChannelRepo,
  isEmbedRepo,
  isGuildRepo,
  isReactionRepo,
  isRoleRepo
} from '../../lib/database/getRepository';
import { selectOneByID, selectOneByName } from '../../lib/database/select';
import { validateByID } from '../../lib/database/validate';
import { guildView } from '../../lib/database/view';

const reactions: ReactionOptionsYesNo = {
  yes: '✅',
  no: '❌',
};

const options = Object.values(Entities);

export default class deleteRecord extends ConnectionCommand {
  constructor(client: ConnectionClient) {
    super(client, {
      name: 'deleterecord',
      aliases: ['drecord', 'dr'],
      group: 'database',
      memberName: 'deleterecord',
      description: "Deletes a record from the guild's database.",
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES'],
    });
  }

  async run(message: CommandoMessage) {
    const conn = this.client.conn;

    const exists = await validateByID(conn, message.guild, Entities.Guild);
    if (!exists) {
      message.reply(`${message.guild} does not exist in the database. Try registering it first.`);
      return null;
    }

    const embed = await guildView(conn, message.guild);
    if (embed == null) {
      message.say(`There was an error creating a view for ${message.guild} ...`);
      return null;
    }
    embed.setDescription('**Delete Records**');

    const prompt = stripIndents`
    Specify the type of record to delete: \`${options.join('`, `')}\`, followed by the name or id of the record.
    Sending the channel mention or emoji is also valid. Multiple records of the same type can be entered at the same time.

    For example: \`channel <#798740558943617025> 798740415692013599\` will remove the text channels with ids \`798740558943617025\` and \`798740415692013599\`, if they are registered to the guild.

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

      const i = m.content.indexOf(' ');
      const entity =
        i != -1
          ? m.content.substr(0, m.content.indexOf(' '))
          : m.content.substr(m.content.indexOf(' ') + 1).split(/ +/)[0];

      const records = (await parser(m, conn)) as (
        | ChannelEntity
        | EmbedEntity
        | GuildEntity
        | ReactionEntity
        | RoleEntity
      )[];

      const repo = getRepository(conn, entity as string);
      if (repo == null) return;

      const names = `\`${records.map((r) => (r as Base).name || (r as EmbedEntity).title).join('`, `')}\``;
      try {
        if (isChannelRepo(repo)) {
          repo.remove(records as ChannelEntity[]);
          await m.say(
            `Text channel(s) ${names} have been removed. Continue removing other records or enter \`stop\` to end the command.`,
          );
        }

        if (isEmbedRepo(repo)) {
          repo.remove(records as EmbedEntity[]);
          await m.say(
            `Embed message(s) ${names} have been removed. Continue removing other records or enter \`stop\` to end the command.`,
          );
        }

        if (isGuildRepo(repo)) {
          const reply = await m.reply(
            `This will remove ${m.guild} and all associated records from the database. This action cannot be undone. Are you sure you want to delete it?`,
          );

          for (const reaction of Object.values(reactions)) {
            await reply.react(reaction);
          }

          await reply
            .awaitReactions((reaction: MessageReaction, user: User) => filterYesNo(reaction, user, m), {
              max: 1,
              time: 10 * 1000,
            })
            .then(async (collected) => {
              const reaction = collected.first();
              if (reaction == undefined) return;
              if (reaction.emoji.name == reactions.yes) {
                repo.remove(records as GuildEntity[]);
                await m.say(`${m.guild} has successfully been removed from the database. Ending the command ...`);

                return collector.stop();
              }
              await m.say(
                `Cancelling removal of ${m.guild}. Continue removing other records or enter \`stop\` to end the command.`,
              );
            });
        }

        if (isReactionRepo(repo)) {
          repo.remove(records as ReactionEntity[]);
          await m.say(
            `Reaction(s) ${names} have been removed. Continue removing other records or enter \`stop\` to end the command.`,
          );
        }

        if (isRoleRepo(repo)) {
          repo.remove(records as RoleEntity[]);
          await m.say(
            `Role(s) ${names} have been removed. Continue removing other records or enter \`stop\` to end the command.`,
          );
        }
      } catch (e) {
        console.error(`There was an error removing ${names} from the database: `, e);
      }

      const edit =
        (await guildView(conn, m.guild))?.setDescription('**Delete Records**') ??
        new MessageEmbed().setTitle(m.guild.name).setDescription('Deleted from database.');
      await view.edit(edit);
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
  if (m.content.toLowerCase().startsWith('guild')) {
    return [await selectOneByID(conn, m.guild, Entities.Guild)];
  }

  const entity = m.content.substr(0, m.content.indexOf(' '));
  const inputs = m.content.substr(m.content.indexOf(' ') + 1).split(/ +/);

  if (entity == '') {
    m.say('No argument was provided ...');
    return null;
  }

  if (!options.some((o) => o == entity)) {
    m.say('Invalid record type was provided');
    return null;
  }

  const records = [];
  for (const input of inputs) {
    if (entity == Entities.Embed) {
      records.push(await selectOneByName(conn, m.guild, entity, input));
    } else if (entity == Entities.Channel && CHANNEL_ID.test(input)) {
      const id = (input.match(CHANNEL_ID) as string[])[0];
      records.push(await selectOneByID(conn, m.guild, entity, id));
    } else if (entity == Entities.Reaction && EMOJI_ID.test(input)) {
      const id = (input.match(EMOJI_ID) as string[])[0];
      records.push(await selectOneByID(conn, m.guild, entity, id));
    } else if (entity == Entities.Role && ROLE_ID.test(input)) {
      const id = (input.match(ROLE_ID) as string[])[0];
      records.push(await selectOneByID(conn, m.guild, entity, id));
    } else {
      records.push(await selectOneByName(conn, m.guild, entity, input));
    }
  }
  return records.filter((r) => r != undefined);
}

async function filterYesNo(reaction: MessageReaction, user: User, m: CommandoMessage) {
  if (user != m.author) return false;
  return Object.values(reactions).some((r) => r == reaction.emoji.name);
}
