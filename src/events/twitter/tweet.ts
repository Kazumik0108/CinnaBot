import { CommandoClient } from 'discord.js-commando';
import Twit, { Tweet } from 'twit';
import { TwitterUser } from '../../info/server/twitterUsers';

export default async (client: CommandoClient, Twitter: Twit, user: TwitterUser, tweet: Tweet) => {
  // if (tweet.retweeted_status || tweet.quoted_status) return;
  // const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
  // for (const channelID of user.channels) {
  //   const channel = <TextChannel>await client.channels.fetch(channelID);
  //   channel.send(url).catch((e) => console.log(`Failed to send twitter post to ${channel}: ${e}`));
  // }
};
