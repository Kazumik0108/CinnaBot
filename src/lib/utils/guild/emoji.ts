import { Guild, GuildEmoji } from 'discord.js';
import { EMOJI_ID } from '../../common/regex';

export function getGuildEmoji(property: string, guild: Guild) {
  const input = EMOJI_ID.test(property) ? (property.match(EMOJI_ID) as string[])[0] : property;
  const emoji = guild.emojis.cache.find((e) => e.id == input || e.name == input);
  return emoji != undefined ? emoji : null;
}

export function isEmoji(emoji: unknown): emoji is GuildEmoji {
  return emoji instanceof GuildEmoji;
}

export function isGuildEmoji(emoji: unknown, guild: Guild): emoji is GuildEmoji {
  if (!isEmoji(emoji)) return false;
  const emojis = guild.emojis.cache;
  return emojis.some((e) => e.id == emoji.id);
}
