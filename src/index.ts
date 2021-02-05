import { CommandoClient } from 'discord.js-commando';
import { config } from 'dotenv';
import { readdir } from 'fs';
import { join } from 'path';
import { prefix, currentowner, homeinvite } from '../config.json';

config({ path: join(__dirname, '../', '/process.env') });

// Commando client
const client = new CommandoClient({
    commandPrefix: prefix,
    owner: currentowner,
    invite: homeinvite,
    disableMentions: 'everyone',
});

// read client event files
readdir(join(__dirname, '../', '/events'), (error, files) => {
    const jsFiles = files.filter(file => file.endsWith('js'));
    if (error) return console.log(error);
    jsFiles.forEach(file => {
        const event = require(`../events/${file}`);
        const eventName: any = file.split('.')[0];
        client.on(eventName, event.bind(null, client));
    });
});

client.login(process.env.CLIENT_TOKEN);