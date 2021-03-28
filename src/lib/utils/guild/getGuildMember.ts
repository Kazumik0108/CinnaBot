import { Guild } from 'discord.js';

export const getGuildMember = (id: string, guild: Guild) => {
  const member = guild.member(id);
  return member != null ? member : null;
};
