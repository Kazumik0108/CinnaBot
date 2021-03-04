import { CommandoMessage } from 'discord.js-commando';
import { botReactions } from '../../info/server/botReactions';
import { EMOJI } from '../../lib/common/regex';

const checkMessageFormat = async (message: CommandoMessage) => {
  const remainder = message.content.replace(EMOJI, '').match(/\S+/g);
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
        await message
          .react(emoji)
          .catch(() => console.log(`Could not react to the message in ${message.channel} with ${emoji}`));
      }
    }
  }
};
