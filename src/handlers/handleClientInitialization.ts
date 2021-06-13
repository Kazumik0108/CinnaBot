import { ClientEvents, Intents } from 'discord.js';
import { readdir } from 'fs';
import { join } from 'path';
import { currentowner, homeinvite, prefix } from '../config.json';
import { ConnectionClient } from '../lib/common/classes';
import { prepareConnection } from '../lib/database/prepareConnection';

export const handleClientInitialization = async () => {
  const myIntents = new Intents(Intents.NON_PRIVILEGED);
  myIntents.remove(['DIRECT_MESSAGE_TYPING', 'GUILD_VOICE_STATES', 'GUILD_MESSAGE_TYPING']);
  myIntents.add(['GUILD_MEMBERS', 'GUILD_PRESENCES']);

  const conn = await prepareConnection();

  const client = new ConnectionClient({
    commandPrefix: prefix,
    owner: currentowner,
    invite: homeinvite,
    disableMentions: 'everyone',
    partials: ['MESSAGE', 'REACTION'],
    ws: { intents: myIntents },
    conn: conn,
  });

  const dir = join(__dirname, '.././events/discord');
  readdir(dir, (error, files) => {
    if (error) return console.log(error);
    files.forEach((file) => {
      import(`${dir}/${file}`).then((event) => {
        const eventName = file.split('.')[0];
        client.on(<keyof ClientEvents>eventName, event.default.bind(null, client));
      });
    });
  });

  return client;
};
