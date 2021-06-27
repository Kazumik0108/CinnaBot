/* eslint-disable @typescript-eslint/no-unused-vars */
import { MessageEmbed, MessageReaction, TextChannel, User } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { Connection, InsertResult } from 'typeorm';
import { EmbedEntity } from '../../entity';
import { handleCreateEmbed } from '../../handlers/embed/handleEmbedInputs';
import { handleGetSaveChannel } from '../../handlers/embed/handleGetSaveChannel';
import { ConnectionClient, ConnectionCommand } from '../../lib/common/classes';
import { Entities } from '../../lib/common/enums';
import { ReactionOptionsYesNo } from '../../lib/common/interfaces';
import { bind } from '../../lib/database/bind';
import { registerChannel, registerEmbed } from '../../lib/database/register';
import { selectOneByName } from '../../lib/database/select';
import { updateEmbed } from '../../lib/database/update';
import { validateChannel, validateEmbed } from '../../lib/database/validate';

const reactions: ReactionOptionsYesNo = {
  yes: '✅',
  no: '❌',
};

export default class makeEmbed extends ConnectionCommand {
  constructor(client: ConnectionClient) {
    super(client, {
      name: 'makeembed',
      aliases: ['membed', 'me'],
      group: 'database',
      memberName: 'makeembed',
      description: 'Creates an embed message and registers it to the database.',
      guildOnly: true,
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES'],
    });
  }

  async run(message: CommandoMessage) {
    const conn = this.client.conn;

    const embed = await handleCreateEmbed(message);
    if (embed == null) return null;

    const channel = await handleGetSaveChannel(message);
    if (channel instanceof TextChannel && (await validateChannel(conn, channel)) == false) {
      await registerChannel(conn, channel);
      await bind(conn, { type: 'channel', args: { channel: channel } });
    }

    if ((await validateEmbed(conn, message.guild, embed)) == false) {
      return await saveEmbed(conn, message, embed, channel);
    }

    const verify = await message.say(
      `An embed message with the title ${
        embed.title as string
      } is already registered to the database. Do you want to overwrite it ?`,
    );
    for (const react of Object.values(reactions)) {
      await verify.react(react);
    }

    const collector = verify.createReactionCollector(
      (react: MessageReaction, user: User) => filter(react, user, message),
      {
        max: 1,
        time: 10 * 1000,
      },
    );

    collector.on('collect', async (react: MessageReaction) => {
      if (react.emoji.name == reactions.no) return;
      const record = await selectOneByName(conn, message.guild, Entities.Embed, embed.title as string);
      if (record instanceof EmbedEntity) await updateEmbed(conn, record, embed, message.guild, channel);
    });
    return null;
  }
}

async function filter(react: MessageReaction, user: User, message: CommandoMessage) {
  if (user != message.author) return false;
  return Object.values(reactions).some((r) => r == react.emoji.name);
}

async function saveEmbed(conn: Connection, message: CommandoMessage, embed: MessageEmbed, channel?: TextChannel) {
  try {
    const result = await registerEmbed(conn, message.guild, embed);
    if (result instanceof InsertResult) {
      const uuid = result.identifiers[0].uuid;
      await bind(conn, { type: 'embed', args: { uuid: uuid, guild: message.guild, channel: channel } });
      await message.say(`The embed message \`${embed.title}\` was added to the database.`);
    }
  } catch (e) {
    await message.say(`There was an error adding the embed message to the database.`);
    console.log('An error occurred adding an embed message to the database: ', e);
  }
  return null;
}
