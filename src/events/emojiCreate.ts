import { Guild, GuildEmoji, TextChannel } from 'discord.js';
import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { guildRinSolo } from '../info/server/guilds';
import { getGuildEmotes, sendGuildEmotes } from '../commands/emote/emotelist';

export default async (client: CommandoClient, emoji: GuildEmoji) => {
  const hasSubscribers = guildRinSolo.emoteServers.find((serverID) => serverID == emoji.guild.id);
  if (hasSubscribers == undefined) return;

  const channel = client.channels.cache.get(guildRinSolo.emoteChannel) as TextChannel;
  if (channel == undefined) {
    console.log(`Subscriber guild id ${guildRinSolo.id} is invalid`);
    return;
  }
  await channel.messages.fetch({ limit: 150 }, true, true);
  await channel.bulkDelete(channel.messages.cache.size).catch(() => console.log('There were no messages to delete.'));

  const message = new CommandoMessage(client, { id: `${guildRinSolo.id}, emojiCreate` }, channel);
  let emoteMessage = await getGuildEmotes(message.guild as Guild);
  await sendGuildEmotes(message, emoteMessage);

  const promises = guildRinSolo.emoteServers.map(async (serverID) => {
    const subscribedGuild = client.guilds.cache.get(serverID) as Guild;
    return await getGuildEmotes(subscribedGuild);
  });
  Promise.all(promises).then(async (emoteMessages) => {
    for (emoteMessage of emoteMessages) {
      await sendGuildEmotes(message, emoteMessage);
    }
  });
};
