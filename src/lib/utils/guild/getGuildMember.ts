import { Guild } from 'discord.js';

export const getGuildMember = (property: string, guild: Guild) => {
  const member = guild.member(property);
  return member != null ? member : null;
};
