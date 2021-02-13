// index.ts
import { CommandoClient } from 'discord.js-commando';
import { config } from 'dotenv';
import { readdir } from 'fs';
import { join } from 'path';
import { prefix, currentowner, homeinvite } from './config.json';

config({ path: join(__dirname, '../process.env') });

// Commando client
const client = new CommandoClient({
  commandPrefix: prefix,
  owner: currentowner,
  invite: homeinvite,
  disableMentions: 'everyone',
  partials: ['MESSAGE', 'REACTION'],
});

// Read client event files
readdir(join(__dirname, './events'), (error, files) => {
  if (error) return console.log(error);
  files.forEach((file) => {
    import(`./events/${file}`).then((event) => {
      const eventName = file.split('.')[0];
      client.on(eventName as any, event.main.bind(null, client));
    });
  });
});

// log into Discord with client
client.login(process.env.CLIENT_TOKEN);
