import { Collection, Guild } from 'discord.js';
import { CommandoGuild, CommandoMessage } from 'discord.js-commando';

export const getUserGuilds = (message: CommandoMessage) => {
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
export const searchEmojiName = (guilds: CommandoGuild | Guild | Collection<string, Guild>, name: string) => {
  let emojiMatch = undefined;
  if (guilds instanceof CommandoGuild || guilds instanceof Guild) {
    emojiMatch = guilds.emojis.cache.find((emoji) => emoji.name.toLowerCase() == name.toLowerCase());
  } else {
    emojiMatch = guilds
      .flatMap((guild) => guild.emojis.cache)
      .find((emoji) => emoji.name.toLowerCase() == name.toLowerCase());
  }
  return emojiMatch;
};
