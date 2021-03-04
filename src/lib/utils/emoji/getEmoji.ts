import { Guild, Collection } from 'discord.js';
import { CommandoGuild } from 'discord.js-commando';

export const getEmoji = (name: string, guilds: Guild | Collection<string, Guild>) => {
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
