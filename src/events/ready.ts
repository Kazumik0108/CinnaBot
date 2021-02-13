// ready.ts
import { join } from 'path';
import { twitterUsers } from '../info/server/twitterUsers';
import { Status, botStatuses } from '../info/botStatuses';
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

const createTwitterStreams = (client: CommandoClient) => {
  twitterUsers.forEach((twitterUser) => {
    const stream = TwitterBot.stream('statuses/filter', { follow: twitterUser.id });

    stream.on('tweet', (tweet: any) => {
      if (tweet.retweeted_status || tweet.quoted_status) return;

      const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
      twitterUser.channels.forEach((twitterChannel) => {
        client.channels
          .fetch(twitterChannel)
          .then((channel) => (channel as TextChannel).send(url))
          .catch((error) => console.log(`Failed to cache channel ${twitterChannel}: `, error));
      });
    });

    console.log(`Successfully created stream event for Twitter ID ${twitterUser.handle}`);
  });
};

const chooseActivity = (): Status => {
  const statusGroup = botStatuses[Math.floor(Math.random() * botStatuses.length)];
  const status: Status = {
    id: statusGroup.id,
    name: statusGroup.name,
    activity: statusGroup.activities[Math.floor(Math.random() * statusGroup.activities.length)],
  };
  return status;
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

  createTwitterStreams(client);

  function setStatus() {
    const status = chooseActivity();
    (client.user as ClientUser)
      .setActivity(status.activity, { type: status.id })
      .then((presence) =>
        console.log(`\nActivity set to '${presence.activities[0].type} ${presence.activities[0].name}'`),
      )
      .catch((error) => console.log('Failed to set activity: ', error));
  }
};
