import { Message, MessageEmbed, MessageEmbedOptions } from 'discord.js';

export const handleEmbedMessageData = (data: MessageEmbedOptions, message: Message) => {
  const embed = new MessageEmbed(data).setAuthor(message.author.username, message.author.displayAvatarURL());
  return embed;
};
