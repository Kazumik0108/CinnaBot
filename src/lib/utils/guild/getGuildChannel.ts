import { Guild } from 'discord.js';

export const getGuildChannel = (property: string, guild: Guild) => {
  const channel = guild.channels.cache.find((e) => e.id == property || e.name == property);
  return channel != undefined ? channel : null;
};
