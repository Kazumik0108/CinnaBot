// emojiCreate.ts
import { Guild, GuildEmoji, TextChannel } from 'discord.js';
import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { emoteChannels } from '../info/server/emotechannel';
import { getGuildEmotes, sendGuildEmotes } from '../commands/emote/emotelist';

export const main = (client: CommandoClient, emoji: GuildEmoji) => {
  const subscribers = emoteChannels.filter((channel) => channel.servers.some((server) => server.id === emoji.guild.id));
  if (subscribers) {
    subscribers.forEach(async (subscriber) => {
      const subscriberChannel = client.channels.cache.get(subscriber.id) as TextChannel;
      await subscriberChannel.messages.fetch({ limit: 150 }, true, true);
      await subscriberChannel
        .bulkDelete(subscriberChannel.messages.cache.size)
        .catch(() => console.log('There were no messages to delete.'));

      const message = new CommandoMessage(client, { id: 'emoteCreate' }, subscriberChannel);
      const promises = subscriber.servers.map(async (server) => {
        const subscribedGuild = client.guilds.cache.get(server.id) as Guild;
        return await getGuildEmotes(subscribedGuild);
      });
      Promise.all(promises).then(async (emoteMessages) => {
        for (const emoteMsg of emoteMessages) {
          await sendGuildEmotes(message, emoteMsg);
        }
      });
    });
  }
};
