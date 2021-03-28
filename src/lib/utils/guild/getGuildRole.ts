import { Guild } from 'discord.js';

export const getGuildRole = (property: string, guild: Guild) => {
  const role = guild.roles.cache.find((r) => r.id == property || r.name == property);
  return role != undefined ? role : null;
};
