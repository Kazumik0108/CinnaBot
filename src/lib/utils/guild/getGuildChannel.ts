import { CategoryChannel, Client, NewsChannel, StoreChannel, TextChannel, VoiceChannel } from 'discord.js';

export const getGuildChannel = (id: string, client: Client) => {
  const channel = client.channels.cache.get(id);
  if (channel == undefined || channel.type == 'dm' || channel.type == 'unknown') return null;
  switch (channel.type) {
    case 'text':
      return channel as TextChannel;
    case 'voice':
      return channel as VoiceChannel;
    case 'category':
      return channel as CategoryChannel;
    case 'news':
      return channel as NewsChannel;
    case 'store':
      return channel as StoreChannel;
    default:
      return null;
  }
};
