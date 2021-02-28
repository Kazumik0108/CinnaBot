import { CommandoClient, CommandoMessage } from 'discord.js-commando';

import { handleBotReactions } from '../handlers/message/handleBotReactions';
import { handleNonNitroEmoji } from '../handlers/message/handleNonNitroEmoji';
import { handleSpamEmojiChannels, sendDeleteLog } from '../handlers/message/handleSpamEmojiChannels';

export default async (client: CommandoClient, message: CommandoMessage) => {
  await handleBotReactions(message);

  if (message.author.bot) return;
  if (message.channel.type === 'dm') return;

  const nonNitroWebhookMessage = await handleNonNitroEmoji(message);
  const spamEmojiDeleteEmbed = await handleSpamEmojiChannels(message);
  if (spamEmojiDeleteEmbed != null) {
    message.delete().catch((e) => console.log('Failed to delete a message: ', e));
    if (nonNitroWebhookMessage == null) {
      sendDeleteLog(message, spamEmojiDeleteEmbed);
    } else {
      const botSpamEmojiDeleted = await handleSpamEmojiChannels(nonNitroWebhookMessage);
      if (botSpamEmojiDeleted != null) sendDeleteLog(message, spamEmojiDeleteEmbed);
    }
  }
};
