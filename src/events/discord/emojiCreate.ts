import { GuildEmoji } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { handleEmojiFollowers } from '../../handlers/emoji/handleEmojiFollowers';

export default async (client: CommandoClient, emoji: GuildEmoji) => {
  await handleEmojiFollowers(client, emoji);
};
