import { stripIndents } from 'common-tags';
import { CommandoClient } from 'discord.js-commando';
import { join } from 'path';

import { handleClientActivity } from '../handlers/ready/handleClientActivity';
import { handleClientUser } from '../handlers/ready/handleClientUser';
import { handleGuildList } from '../handlers/ready/handleGuildList';
import { handleTestBot } from '../handlers/ready/handleTestBot';
import { handleTwitterStreams } from '../handlers/ready/handleTwitterStreams';

export default async (client: CommandoClient) => {
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

  const user = handleClientUser(client);
  if (user == null) return;

  const startUpMessage = stripIndents`
    ///// START
    Logged in as ${user.tag}! (${user})
  `;
  console.log(startUpMessage);

  await handleTestBot(client, user);
  await handleGuildList(client);
  await handleTwitterStreams(client);
  await handleClientActivity(user);
  setInterval(async () => {
    await handleClientActivity(user);
  }, 10 * 60 * 1000);
};
