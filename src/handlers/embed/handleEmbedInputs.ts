import { stripIndents } from 'common-tags';
import { ColorResolvable, GuildChannel, GuildEmoji, MessageAttachment, MessageEmbed, Role } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import isImageUrl from 'is-image-url';
import { EmbedInputs } from '../../lib/common/enums';
import { ANY_ID, REPLACE_ID } from '../../lib/common/regex';
import { sleep } from '../../lib/utils/collector/sleep';
import { hexColorParser } from '../../lib/utils/color/parseHexColor';
import { getGuildChannel, isTextChannel } from '../../lib/utils/guild/channel';
import { getGuildEmoji } from '../../lib/utils/guild/emoji';
import { getGuildMember } from '../../lib/utils/guild/member';
import { getGuildRole } from '../../lib/utils/guild/role';

const inputs = Object.values(EmbedInputs);
const clearInputs = inputs.filter((i) => i != EmbedInputs.title);
const inputString = '`' + inputs.join('`, `') + '`';
const clearString = '`' + clearInputs.join('`, `') + '`';
const clear = 'clear';
const next = 'next';
const cancel = 'cancel';

export async function handleCreateEmbed(message: CommandoMessage) {
  const guildMember = getGuildMember(message.author.id, message.guild);
  if (guildMember == null) {
    message.reply(`You are not a guild member of ${message.guild} ...`);
    return null;
  }
  const embed: MessageEmbed = new MessageEmbed()
    .setTitle('Create Custom Embed')
    .setAuthor(guildMember.nickname ?? guildMember.displayName, guildMember.user.displayAvatarURL())
    .setFooter(message.guild)
    .setTimestamp();

  const timer = 5;
  const promptMsg = stripIndents`
  To edit your custom embed below, send a message beginning with one of the following keys: ${inputString}. Channels and emojis from this guild can be directly mentioned into the embed. A role, channel, or emoji from this guild may also be added by entering their id enclosed with arrows, e.g. \`<296086879776931842>\`.

  To clear a value, use \`${clear}\` followed by one of the keys. The title field cannot be cleared.
  To save your embed, use \`${next}\`.
  To cancel the commando, use \`${cancel}\`.

  This command will timeout after ${timer} minutes of inactivity and refresh after every input.
  `;

  const prompt = await message.reply(promptMsg, embed);
  const collector = message.channel.createMessageCollector((m: CommandoMessage) => filter(m, message), {
    time: 60 * 1000 * timer,
  });

  collector.on('collect', (m: CommandoMessage) => {
    if (m.content.toLowerCase().startsWith(next)) {
      return collector.stop();
    }

    if (m.content.toLowerCase().startsWith(cancel)) {
      prompt.embeds = [];
      message.reply('Cancelling the command ...');
      return collector.stop();
    }
    collector.resetTimer({ time: 60 * 1000 * timer });

    const key = m.content.substr(0, m.content.indexOf(' ')).toLowerCase();
    const content = m.content.substr(m.content.indexOf(' ') + 1, m.content.length).trim();
    switch (key) {
      case clear: {
        switch (content) {
          case EmbedInputs.color:
            embed.setColor(0);
            break;
          case EmbedInputs.description:
            embed.setDescription('');
            break;
          case EmbedInputs.image:
            embed.setImage('');
            break;
          case EmbedInputs.thumbnail:
            embed.setThumbnail('');
            break;
        }
        break;
      }
      case EmbedInputs.color: {
        const color = hexColorParser(content) as ColorResolvable;
        embed.setColor(color);
        break;
      }
      case EmbedInputs.description: {
        const one = content.indexOf('<');
        const two = content.indexOf('>');
        const description = two > one ? replaceIDs(content, m) : content;
        embed.setDescription(description);
        break;
      }
      case EmbedInputs.image:
        embed.setImage(content);
        break;
      case EmbedInputs.thumbnail:
        embed.setThumbnail(content);
        break;
      case EmbedInputs.title:
        embed.setTitle(content);
        break;
    }
    prompt.edit(embed);
  });

  while (!collector.ended) await sleep(1 * 1000);
  return prompt.embeds.length == 1 ? prompt.embeds[0] : null;
}

function filter(m: CommandoMessage, message: CommandoMessage) {
  if (m.author != message.author) return false;
  if (m.content.toLowerCase().startsWith(next) || m.content.toLowerCase().startsWith(cancel)) return true;

  const key = m.content.substr(0, m.content.indexOf(' ')).toLowerCase();
  const content = m.content.substr(m.content.indexOf(' ') + 1, m.content.length).trim();

  if (key == '') {
    if (content.toLowerCase().startsWith(clear)) {
      message.say(`A key must be provided for \`${clear}\`. Try again.`);
      return false;
    }

    if (!inputs.some((i) => content.toLowerCase().startsWith(i))) {
      message.say(`Invalid key. Must be one of ${inputString}.`);
      return false;
    }

    if (content.toLowerCase() == 'title') {
      message.say(`An input must be provided for \`${content}\`.`);
      return false;
    }

    if (content.toLowerCase() == EmbedInputs.image || content.toLowerCase() == EmbedInputs.thumbnail) {
      const attachments = m.attachments;
      if (attachments.size == 0) {
        message.say(`An image url or image file must be provided for \`${content}\`.`);
        return false;
      }

      const attachment = attachments.first() as MessageAttachment;
      if (isImageUrl(attachment.url)) return true;

      message.say(`An invalid file was provided for ${content}.`);
      return false;
    }

    message.say(
      `An input must be provided for \`${content}\`. If you want to clear a field, use \`${clear} ${content}\`.`,
    );
    return false;
  }

  if (key == clear) {
    if (!clearInputs.some((i) => i == content.toLowerCase())) {
      message.say(`One of ${clearString} must be provided for \`${clear}\`.`);
      return false;
    }
    return true;
  }

  if (!inputs.some((i) => i == key)) {
    message.say(`Invalid key. Must be one of ${inputString}.`);
    return false;
  }

  if (key == EmbedInputs.color) {
    const color = hexColorParser(content);
    if (color == null) {
      message.say('Invalid hex code. Must be between #000000 and #ffffff.');
      return false;
    }
    return true;
  }

  if (key == EmbedInputs.image || key == EmbedInputs.thumbnail) {
    if (!isImageUrl(content)) {
      message.say('Invalid image url.');
      return false;
    }
    return true;
  }
  return true;
}

function replaceIDs(content: string, m: CommandoMessage) {
  const newContent = content.replace(REPLACE_ID, (substring: string) => {
    const id = (substring.match(ANY_ID) as RegExpMatchArray)[0];

    const channel = getGuildChannel(id, m.guild);
    if (channel instanceof GuildChannel && isTextChannel(channel)) return channel.toString();

    const role = getGuildRole(id, m.guild);
    if (role instanceof Role) return role.toString();

    const emoji = getGuildEmoji(id, m.guild);
    if (emoji instanceof GuildEmoji) return emoji.toString();

    return substring;
  });
  return newContent;
}
