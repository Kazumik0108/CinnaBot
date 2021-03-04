import { CommandoClient } from 'discord.js-commando';
import { Response, Stream } from 'twit';

export default async (client: CommandoClient, stream: Stream, response: Response) => {
  console.log('\n/// START TWITTER CLIENT ///');
  const ids = stream.reqOpts.form.follow.split(/,/g);
  for (const id of ids) {
    console.log(`Stream created for Twitter id @${id}`);
  }
  console.log('\n');
};
