import {
  CategoryChannel,
  Client,
  Guild,
  Message,
  NewsChannel,
  StoreChannel,
  TextChannel,
  VoiceChannel
} from 'discord.js';

export const getGuildChannel = (id: string, ref: Client | Message) => {
  const channel = ref instanceof Client ? ref.channels.cache.get(id) : (<Guild>ref.guild).channels.cache.get(id);
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
