import { Collection, Guild, GuildEmoji } from 'discord.js';
import { EMOJI_ID } from '../../common/regex';

export function getGuildEmoji(property: string, guild: Guild | Collection<string, Guild>, exact = true) {
  const input = EMOJI_ID.test(property) ? (property.match(EMOJI_ID) as string[])[0] : property;
  if (guild instanceof Guild) {
    const emoji = guild.emojis.cache.find(
      (e) => e.id == input || (exact == true ? e.name == input : e.name.toLowerCase() == input.toLowerCase()),
    );
    return emoji != undefined ? emoji : null;
  }
  const emoji = guild
    .flatMap((g) => g.emojis.cache)
    .find((e) => e.id == input || (exact == true ? e.name == input : e.name.toLowerCase() == input.toLowerCase()));
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
