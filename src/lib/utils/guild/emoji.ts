import { Guild, GuildEmoji } from 'discord.js';

export function getGuildEmoji(property: string, guild: Guild) {
  const emoji = guild.emojis.cache.find((e) => e.id == property || e.name == property);
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
