// ready.ts
import { join } from 'path';
import { reactMessages } from '../info/server/reactionroles';
import { twitterUsers } from '../info/server/twitter';
import { statuses } from '../info/botinfo';
import { ClientUser, TextChannel } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { config } from 'dotenv';
import Twit = require('twit');

config({ path: join(__dirname, '../../process.env') });

const TwitterBot = new Twit({
  consumer_key: process.env.API_KEY as string,
  consumer_secret: process.env.API_KEY_SECRET as string,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

const startUpMessages = async (client: CommandoClient) => {
  const guilds = client.guilds.cache.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  console.log(`\nLogged in as ${(client.user as ClientUser).tag}! (${(client.user as ClientUser).id})\n`);
  console.log('List of guilds for this application:');

  guilds.forEach((guild) => {
    console.log(`\t${guild.id} | ${guild.name}`);
  });
};

const cacheReactionMessages = (client: CommandoClient) => {
  const promises = reactMessages.map((reactMessage) => {
    const guildChannel = client.channels.cache.get(reactMessage.channel?.id as string) as TextChannel;
    return guildChannel.messages.fetch(reactMessage.id, true, false);
  });

  Promise.all(promises)
    .then(async (messages) => {
      for (const message of messages) {
        const confirmation =
          'Sucessfully added message ' +
          message.id +
          ' to cache from server ' +
          message.guild?.name +
          ' in channel ' +
          (message.channel as TextChannel).name +
          '.';
        console.log(confirmation);
      }
    })
    .catch((error) => console.log('Failed to cache a message: ', error));
};

const createTwitterStreams = (client: CommandoClient) => {
  twitterUsers.forEach((twitterUser) => {
    const stream = TwitterBot.stream('statuses/filter', { follow: twitterUser.id });

    stream.on('tweet', (tweet: any) => {
      if (tweet.retweeted_status || tweet.quoted_status) return;

      const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
      twitterUser.channels.forEach((twitterChannel) => {
        client.channels
          .fetch(twitterChannel.id)
          .then((channel) => (channel as TextChannel).send(url))
          .catch((error) => console.log(`Failed to cache channel ${twitterChannel.id}: `, error));
      });
    });

    console.log(`Successfully created stream event for Twitter ID ${twitterUser.handle}`);
  });
};

export const main = (client: CommandoClient) => {
  startUpMessages(client);
  setInterval(setStatus, 10 * 60 * 1000);

  client.registry
    .registerDefaultTypes()
    .registerGroups([
      ['server', 'Server Function Commands'],
      ['events', 'Emit Client Event Commands'],
      ['emote', 'Emote and Reaction Commands'],
      ['wiki', 'Gem Wiki Information'],
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn({
      filter: /^([^.].*)\.(js|ts)$/,
      dirname: join(__dirname, '../commands/'),
    });

  cacheReactionMessages(client);
  createTwitterStreams(client);

  function setStatus() {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    (client.user as ClientUser)
      .setActivity(status.content, { type: status.id })
      .then((presence) =>
        console.log(`\nActivity set to '${presence.activities[0].type} ${presence.activities[0].name}'`),
      )
      .catch(console.error);
  }
};
