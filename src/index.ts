import { ClientEvents, Intents } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { config } from 'dotenv';
import { readdir } from 'fs';
import { join } from 'path';
import { prefix, currentowner, homeinvite } from './config.json';

config({ path: join(__dirname, '../process.env') });

const myIntents = new Intents(Intents.NON_PRIVILEGED);
myIntents.remove(['DIRECT_MESSAGE_TYPING', 'GUILD_VOICE_STATES', 'GUILD_MESSAGE_TYPING']);
myIntents.add(['GUILD_MEMBERS', 'GUILD_PRESENCES']);

const client = new CommandoClient({
  commandPrefix: prefix,
  owner: currentowner,
  invite: homeinvite,
  disableMentions: 'everyone',
  partials: ['MESSAGE', 'REACTION'],
  ws: { intents: myIntents },
});

readdir(join(__dirname, './events'), (error, files) => {
  if (error) return console.log(error);
  files.forEach((file) => {
    import(`./events/${file}`).then((event) => {
      const eventName = file.split('.')[0];
      client.on(<keyof ClientEvents>eventName, event.default.bind(null, client));
    });
  });
});

client.login(process.env.CLIENT_TOKEN);

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection: ', error);
});
