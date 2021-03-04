import { CommandoClient } from 'discord.js-commando';
import { readdir } from 'fs';
import { join } from 'path';
import Twit, { ConfigKeys } from 'twit';
import { twitterUsers } from '../info/server/twitterUsers';

export const handleTwitterInitialization = async (client: CommandoClient) => {
  const configKeys: ConfigKeys = {
    consumer_key: <string>process.env.API_KEY,
    consumer_secret: <string>process.env.API_KEY_SECRET,
    access_token: <string>process.env.ACCESS_TOKEN,
    access_token_secret: <string>process.env.ACCESS_TOKEN_SECRET,
  };

  const Twitter = new Twit(configKeys);
  const ids = twitterUsers.map((t) => t.id);
  const stream = Twitter.stream('statuses/filter', { follow: ids });

  const dir = join(__dirname, '.././events/twitter');
  readdir(dir, (error, files) => {
    if (error) return console.log(error);
    files.forEach((file) => {
      import(`${dir}/${file}`).then((event) => {
        const eventName = file.split('.')[0];
        stream.on(eventName, event.default.bind(null, client, stream));
      });
    });
  });

  return stream;
};
