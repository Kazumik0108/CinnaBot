import { Guild } from 'discord.js';
import { CHANNEL_ID } from '../../common/regex';

export const getGuildChannel = (property: string, guild: Guild) => {
  const input = CHANNEL_ID.test(property) ? (property.match(CHANNEL_ID) as string[])[0] : property;
  const channel = guild.channels.cache.find((e) => e.id == input || e.name == input);
  return channel != undefined ? channel : null;
};
