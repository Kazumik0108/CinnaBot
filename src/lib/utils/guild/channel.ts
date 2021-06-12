import { CategoryChannel, Guild, GuildChannel, NewsChannel, StoreChannel, TextChannel, VoiceChannel } from 'discord.js';
import { CHANNEL_ID } from '../../common/regex';

export function getGuildChannel(property: string, guild: Guild) {
  const input = CHANNEL_ID.test(property) ? (property.match(CHANNEL_ID) as string[])[0] : property;
  const channel = guild.channels.cache.find((c) => c.id == input || c.name == input);
  return channel != undefined ? channel : null;
}

export function validateGuildChannel(property: string, guild: Guild) {
  const input = CHANNEL_ID.test(property) ? (property.match(CHANNEL_ID) as string[])[0] : property;
  return guild.channels.cache.some((c) => c.id == input || c.name == input);
}

export function isChannel(channel: unknown): channel is GuildChannel {
  return channel instanceof GuildChannel;
}

export function isGuildChannel(channel: unknown, guild: Guild): channel is GuildChannel {
  if (!isChannel(channel)) return false;
  const channels = guild.channels.cache;
  return channels.some((c) => c.id == channel.id);
}

export function isCategoryChannel(channel: unknown): channel is CategoryChannel {
  if (!isChannel(channel)) return false;
  return channel.type == 'category';
}

export function isNewsChannel(channel: unknown): channel is NewsChannel {
  if (!isChannel(channel)) return false;
  return channel.type == 'news';
}

export function isStoreChannel(channel: unknown): channel is StoreChannel {
  if (!isChannel(channel)) return false;
  return channel.type == 'store';
}

export function isTextChannel(channel: unknown): channel is TextChannel {
  if (!isChannel(channel)) return false;
  return channel.type == 'text';
}

export function isVoiceChannel(channel: unknown): channel is VoiceChannel {
  if (!isChannel(channel)) return false;
  return channel.type == 'voice';
}
