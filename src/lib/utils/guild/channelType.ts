import { CategoryChannel, GuildChannel, NewsChannel, StoreChannel, TextChannel, VoiceChannel } from 'discord.js';

export const isGuildChannel = (channel: unknown): channel is GuildChannel => {
  return channel instanceof GuildChannel;
};

export const isCategoryChannel = (channel: GuildChannel): channel is CategoryChannel => {
  return channel.type == 'category';
};

export const isNewsChannel = (channel: GuildChannel): channel is NewsChannel => {
  return channel.type == 'news';
};

export const isStoreChannel = (channel: GuildChannel): channel is StoreChannel => {
  return channel.type == 'store';
};

export const isTextChannel = (channel: GuildChannel): channel is TextChannel => {
  return channel.type == 'text';
};

export const isVoiceChannel = (channel: GuildChannel): channel is VoiceChannel => {
  return channel.type == 'voice';
};
