import { Message } from 'discord.js';

export const getUserGuilds = (message: Message) => {
  const userGuilds = message.client.guilds.cache
    .filter((guild) => guild.member(message.author.id) != null)
    .sort((a, b) => {
      if (a.name.toLowerCase() == message.guild?.name.toLowerCase() || a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      }
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      return 0;
    });
  return userGuilds;
};
