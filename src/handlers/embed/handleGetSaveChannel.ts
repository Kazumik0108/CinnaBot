import { TextChannel } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { sleep } from '../../lib/utils/collector/sleep';
import { getGuildChannel, isTextChannel } from '../../lib/utils/guild/channel';

export async function handleGetSaveChannel(message: CommandoMessage) {
  await message.reply(
    'Specify a text channel to link the embed message to. If you do not want to link a channel, say `none`.',
  );

  const collector = message.channel.createMessageCollector((m: CommandoMessage) => filter(m, message), {
    time: 10 * 1000,
    max: 1,
  });

  while (!collector.ended) await sleep(1 * 1000);

  const collected = collector.collected.first();
  if (collected == undefined || collected.content.toLowerCase() == 'none') return undefined;

  return getGuildChannel(collected.content, message.guild) as TextChannel;
}

function filter(m: CommandoMessage, message: CommandoMessage) {
  if (m.author != message.author) return false;
  if (m.content.toLowerCase() == 'none') return true;

  const channel = getGuildChannel(m.content, m.guild);
  if (channel == null) {
    message.say(`${m.content} is not a valid channel in ${m.guild}.`);
    return false;
  }

  if (!isTextChannel(channel)) {
    message.say('Only text channels can be used.');
    return false;
  }

  return true;
}
