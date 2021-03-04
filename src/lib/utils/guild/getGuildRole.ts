import { Message } from 'discord.js';

export const getGuildRole = (property: string, message: Message) => {
  const role = message.guild?.roles.cache.find((r) => r.id == property || r.name == property);
  if (role != undefined) return role;
  return null;
};
