import { config } from 'dotenv';
import { join } from 'path';

import Twit = require('twit');
import { ConfigKeys } from 'twit';
import { CommandoClient } from 'discord.js-commando';
import { twitterUsers } from '../../info/server/twitterUsers';
import { TextChannel } from 'discord.js';

config({ path: join(__dirname, '../../../process.env') });

const configKeys: ConfigKeys = {
  consumer_key: <string>process.env.API_KEY,
  consumer_secret: <string>process.env.API_KEY_SECRET,
  access_token: <string>process.env.ACCESS_TOKEN,
  access_token_secret: <string>process.env.ACCESS_TOKEN_SECRET,
};

const Twitter = new Twit(configKeys);

export const handleTwitterStreams = async (client: CommandoClient) => {
  for (const twitterUser of twitterUsers) {
    const stream = Twitter.stream('statuses/filter', { follow: twitterUser.id });
    stream.on('tweet', async (tweet) => {
      if (tweet.retweeted_status || tweet.quoted_status) return;

      const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
      for (const channelID in twitterUser.channels) {
        const channel = <TextChannel>await client.channels.fetch(channelID);
        channel.send(url).catch((error) => console.log(`Failed to send twitter post to ${channel}: ${error}`));
      }
    });
  }
};
