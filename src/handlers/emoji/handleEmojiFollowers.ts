import { GuildEmoji, TextChannel } from 'discord.js';
import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { guildRinSolo } from '../../info/server/guilds';
import { handleEmojiListGuild } from './handleEmojiListGuild';

export const handleEmojiFollowers = async (client: CommandoClient, emoji: GuildEmoji) => {
  const follower = guildRinSolo;
  const emojiFromFollower = follower.id == emoji.guild.id;
  const emojiFromFollow = follower.emoteServers.some((id) => id == emoji.guild.id);

  if (!emojiFromFollower && !emojiFromFollow) return;

  const following = follower.emoteServers;
  following.unshift(follower.id);

  const channel = <TextChannel | undefined>client.channels.cache.get(follower.emoteChannel);
  if (channel == undefined) {
    console.log(`The follower guild id ${follower.id} is unknown`);
    return;
  }

  await channel.messages.fetch({ limit: 100 }, true);
  await channel
    .bulkDelete(channel.messages.cache.size)
    .catch(() => console.log(`There were no messages to delete in ${channel}, event emitted by ${emoji}`));

  const message = new CommandoMessage(client, { id: `${follower.id} | emojiCreate event` }, channel);
  for (const follow of following) {
    const guild = client.guilds.cache.get(follow);
    if (guild == undefined) continue;
    await handleEmojiListGuild(message, guild);
  }
};
