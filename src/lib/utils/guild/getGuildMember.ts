import { CommandoMessage } from 'discord.js-commando';

export const getGuildMember = (id: string, m: CommandoMessage) => {
  const member = m.guild.member(id);
  if (member != null) return member;
  return null;
};
