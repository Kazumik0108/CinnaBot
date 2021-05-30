/* eslint-disable no-shadow */
import { MessageEmbed, MessageReaction, TextChannel, User } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { handleEmbedInputs } from '../../handlers/database/handleEmbedInputs';
import { sleep } from '../../lib/utils/collector/sleep';
import { getGuildChannel } from '../../lib/utils/guild/getGuildChannel';

interface PromptArgs {
  channel: TextChannel;
}

enum ReactionYesNo {
  yes = '✅',
  no = '❌',
}

const save = '💾';

export default class makeEmbed extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'makeembed',
      aliases: ['membed', 'me'],
      group: 'database',
      memberName: 'makeembed',
      description:
        'Creates and sends an embed message to a channel within the server, with the option to register it to the database.',
      guildOnly: true,
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES'],
      args: [
        {
          key: 'channel',
          prompt: 'Specify the target text channel for the embed message.',
          type: 'string',
          validate: (input: string, m: CommandoMessage) => {
            const channel = getGuildChannel(input, m.guild);
            return channel != null && channel.type == 'text' ? true : false;
          },
          parse: (input: string, m: CommandoMessage) => {
            const channel = getGuildChannel(input, m.guild) as TextChannel;
            return channel;
          },
        },
      ],
    });
  }

  async run(message: CommandoMessage, { channel }: PromptArgs) {
    const embed = await handleEmbedInputs(message);
    await sendEmbed(message, channel, embed);
    await saveEmbed(message, embed);
    return null;
  }
}

async function sendEmbed(message: CommandoMessage, channel: TextChannel, embed: MessageEmbed) {
  const msg = await message.say(
    `React with ${ReactionYesNo.yes} to send the embed to ${channel} or ${ReactionYesNo.no} to cancel the command.`,
    embed,
  );

  for (const reaction of Object.values(ReactionYesNo)) {
    await msg.react(reaction);
  }

  const collector = msg.createReactionCollector(
    (reaction: MessageReaction, user: User) => filter(message.author, reaction, user),
    {
      time: 30 * 1000,
      maxEmojis: 1,
    },
  );

  collector.on('collect', (reaction: MessageReaction) => {
    switch (reaction.emoji.name) {
      case ReactionYesNo.yes:
        channel.send(embed).then(() => message.reply(`Embed successfuly sent to ${channel}.`));
        break;
      case ReactionYesNo.no:
        message.reply('Canceling the command.');
        break;
    }
    collector.stop();
  });

  while (!collector.ended) {
    await sleep(1 * 1000);
  }
}

async function saveEmbed(message: CommandoMessage, embed: MessageEmbed) {
  const msg = await message.say(`React with ${save} to save the embed to ${message.guild}.`);
  await msg.react(save);

  const collector = msg.createReactionCollector(
    (reaction: MessageReaction, user: User) => filterSave(message.author, reaction, user),
    {
      time: 30 * 1000,
      maxEmojis: 1,
    },
  );

  collector.on('collect', () => {
    console.log(embed.author);
    // save embed to database
    collector.stop();
  });
}

function filter(author: User, reaction: MessageReaction, user: User) {
  if (author != user) return false;
  if (!Object.values(ReactionYesNo).some((r) => reaction.emoji.name == r && reaction.emoji.id == null)) {
    reaction.remove();
    return false;
  }
  return true;
}

function filterSave(author: User, reaction: MessageReaction, user: User) {
  if (author != user) return false;
  if (reaction.emoji.name != save && reaction.emoji.id == null) {
    reaction.remove();
    return false;
  }
  return true;
}
