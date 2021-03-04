import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { handleBotReactions } from '../../handlers/message/handleBotReactions';
import { handleNonNitroEmoji } from '../../handlers/message/handleNonNitroEmoji';
import { handleSpamEmojiChannels, sendDeleteLog } from '../../handlers/message/handleSpamEmojiChannels';

export default async (client: CommandoClient, message: CommandoMessage) => {
  await handleBotReactions(message);

  if (message.author.bot) return;
  if (message.channel.type === 'dm') return;

  const nonNitroWebhookMessage = await handleNonNitroEmoji(message);
  if (nonNitroWebhookMessage != null) {
    message.delete().catch((e) => console.log('Failed to delete a message: ', e));

    const botSpamEmojiDeleteEmbed = await handleSpamEmojiChannels(nonNitroWebhookMessage);
    if (botSpamEmojiDeleteEmbed != null) {
      nonNitroWebhookMessage.delete().catch((e) => console.log('Failed to delete a message: ', e));
      sendDeleteLog(message, botSpamEmojiDeleteEmbed);
    }
    return;
  }

  const spamEmojiDeleteEmbed = await handleSpamEmojiChannels(message);
  if (spamEmojiDeleteEmbed != null) {
    message.delete().catch((e) => console.log('Failed to delete a message: ', e));
    sendDeleteLog(message, spamEmojiDeleteEmbed);
    return;
  }
};
