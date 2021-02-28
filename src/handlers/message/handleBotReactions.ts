import { CommandoMessage } from 'discord.js-commando';
import { EMOJI_REGEX } from '../../functions/regexFilters';
import { botReactions } from '../../info/server/botReactions';

const checkMessageFormat = async (message: CommandoMessage) => {
  const remainder = message.content.replace(EMOJI_REGEX, '').match(/\S+/g);
  if (remainder == null) return true;
  return false;
};

export const handleBotReactions = async (message: CommandoMessage) => {
  const validMessage = await checkMessageFormat(message);
  if (!validMessage) return;

  for (const reactionGroup of botReactions) {
    const match = reactionGroup.emojis.some((reaction) => message.content.includes(reaction));
    if (match) {
      for (const reaction of reactionGroup.emojis) {
        const emoji = message.client.emojis.cache.get(reaction);
        if (emoji == undefined) continue;
        await message.react(emoji);
      }
    }
  }
};
