import { stripIndents } from 'common-tags';
import { GuildEmoji, MessageEmbed, TextChannel } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';

import { spamChannels } from '../../info/server/spamChannels';

const getDeleteMessage = async (message: CommandoMessage, emojis: GuildEmoji[]) => {
  const embed = new MessageEmbed()
    .setAuthor(message.author.username, message.author.displayAvatarURL())
    .setDescription(
      stripIndents`
      **Message sent by ${message.author.toString()} deleted in ${message.channel.toString()}**
      ${message.content}
      `,
    )
    .addFields({
      name: 'Reason for deletion',
      value: stripIndents`
        Messages in ${message.channel} must not contain any text aside from the following emotes:
        ${emojis.map((e) => `${e.toString()} | \`${e.name}\` | \`${e.id}\` | \`${e.guild}\``).join('\n')}
        `,
    })
    .setFooter(`${message.guild.toString()} • Message ID: ${message.id}`)
    .setTimestamp();
  return embed;
};

export const sendDeleteLog = (message: CommandoMessage, embed: MessageEmbed) => {
  message.direct(embed);
  const channel = <TextChannel | undefined>message.guild.channels.cache.get('815479173669716029');
  if (channel == undefined) return;
  channel.send(embed);
};

export const handleSpamEmojiChannels = async (message: CommandoMessage) => {
  const spamChannel = spamChannels.find((c) => c.id == message.channel.id);
  if (spamChannel == undefined) return null;

  const emojis = <GuildEmoji[]>spamChannel.emojis
    .map((id) => {
      return message.guild.emojis.cache.get(id);
    })
    .filter((e) => e != undefined);

  const regex = new RegExp(emojis.map((e) => e.toString()).join('|'), 'g');
  const remainder = message.content.replace(regex, '').match(/\S+/g);
  if (remainder == null) return null;

  const deleteLog = await getDeleteMessage(message, emojis);
  return deleteLog;
};
