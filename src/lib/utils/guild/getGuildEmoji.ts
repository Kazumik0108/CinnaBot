import { Guild } from 'discord.js';

export const getGuildEmoji = (property: string, guild: Guild) => {
  const emoji = guild.emojis.cache.find((e) => e.id == property || e.name == property);
  return emoji != undefined ? emoji : null;
};
