import { stripIndents } from 'common-tags';
import { GuildMember, Message, MessageEmbed, MessageEmbedOptions } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import isImageUrl from 'is-image-url';
import { EmbedInputs } from '../../lib/common/enums';
import { sleep } from '../../lib/utils/collector/sleep';
import { hexColorParser } from '../../lib/utils/color/parseHexColor';
import { getGuildMember } from '../../lib/utils/guild/member';

const collectorInputs = (Object.keys(EmbedInputs) as string[]).concat(['next', 'end', 'json']);

export async function handleEmbedInputs(message: CommandoMessage) {
  const guildMember = getGuildMember(message.author.id, message.guild) as GuildMember;
  let embed = new MessageEmbed()
    .setTitle('Custom Embed')
    .setAuthor(guildMember.nickname || guildMember.displayName, guildMember.user.displayAvatarURL())
    .setFooter(message.guild)
    .setTimestamp();
  const inputs = Object.values(EmbedInputs);
  const prompt = stripIndents`
    To edit the embed, send a message beginning with one of the following keys: \`${inputs.join('`, `')}\`
    Use \`next\` to finish the embed.

    JSON data can be loaded into the embed using the key \`json\`.

    This command will time-out after 1 minute and the timer will reset after every input.
    `;
  const msg = await message.say(prompt, embed);
  embed = await embedEditor(message, msg, embed);

  return embed;
}

async function embedEditor(message: CommandoMessage, embedMsg: CommandoMessage, embed: MessageEmbed) {
  const collector = message.channel.createMessageCollector((m: Message) => filter(message, m), { time: 60 * 1000 });
  collector.on('collect', async (msg: Message) => {
    const space = msg.content.indexOf(' ');
    const input = space == -1 ? msg.content : msg.content.substr(0, space);
    if (input == 'next') return collector.stop();

    const arg = getEmbedArgument(msg, input);
    if (['image', 'thumbnail'].some((i) => i == input) && arg == null) {
      return message.say(`You did not provide a valid URL for the ${input}.`);
    }

    if (!['image', 'thumbnail'].some((i) => i == input) && space == -1) {
      return message.say(`You cannot provide an empty argument for ${input}`);
    }

    embed = await editEmbed(embedMsg, embed, input, arg);
    collector.resetTimer({ time: 60 * 1000 });
  });

  while (!collector.ended) {
    await sleep(1 * 1000);
  }

  return embed;
}

async function editEmbed(embedMsg: CommandoMessage, embed: MessageEmbed, input: string, arg: string | null) {
  switch (input) {
    case EmbedInputs.color: {
      const color = hexColorParser(arg as string);
      if (color == null) {
        embedMsg.say(`${color} is an invalid hex color`);
      } else {
        embed.setColor(color);
      }
      break;
    }
    case EmbedInputs.title:
      embed.setTitle(arg);
      break;

    case EmbedInputs.description:
      embed.setDescription(arg);
      break;

    case EmbedInputs.image:
      embed.setImage(arg as string);
      break;

    case EmbedInputs.thumbnail:
      embed.setThumbnail(arg as string);
      break;

    case EmbedInputs.json: {
      const data = await getJSONData(arg as string);
      if (data == null) {
        embedMsg.say('Invalid JSON form body.');
        break;
      }
      if (!Object.keys(data).some((k) => k == 'description')) {
        embedMsg.say('The field `description` is required.');
        break;
      }

      try {
        const author = embed.author;
        embed = new MessageEmbed(data).setAuthor(author?.name, author?.iconURL);
      } catch {
        embedMsg.say('An invalid field was given to the MessageEmbed class.');
      }
      break;
    }
  }
  embed.setTimestamp();
  embedMsg.edit(embed);
  return embed;
}

function filter(message: CommandoMessage, m: Message) {
  if (m.author != message.author) return false;
  if (m.content.startsWith('end')) return true;

  if (!collectorInputs.some((i) => m.content.startsWith(i))) {
    message.say(`Invalid input. Input must be one of \`${collectorInputs.join('`, `')}\``);
    return false;
  }
  return true;
}

function getEmbedArgument(msg: Message, input: string) {
  const arg = msg.content.substr(msg.content.indexOf(' ') + 1, msg.content.length);
  if (['image', 'thumbnail'].some((i) => i == input)) {
    if (isImageUrl(arg)) return arg;
    const attachments = msg.attachments;
    const url = attachments.first()?.url;
    return url != undefined && isImageUrl(url) ? url : null;
  }
  return arg;
}

async function getJSONData(arg: string) {
  try {
    return JSON.parse(arg as string) as MessageEmbedOptions;
  } catch {
    return null;
  }
}
