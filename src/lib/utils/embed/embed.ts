import { MessageEmbed } from 'discord.js';

export function isEmbed(embed: unknown): embed is MessageEmbed {
  return embed instanceof MessageEmbed;
}
