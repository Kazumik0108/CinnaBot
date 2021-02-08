// ready.ts
import { join } from 'path';
import { reactMessages } from '../info/server/reactionroles';
import { twitterUsers } from '../info/server/twitter';
import { statuses } from '../info/botinfo';
import { ClientUser, TextChannel } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { config } from 'dotenv';
import Twit = require('twit');


config({ path: join(__dirname, '../../process.env') });


function startUpMessages(client: CommandoClient): void {
    console.log(`\nLogged in as ${(client.user as ClientUser).tag}! (${(client.user as ClientUser).id})\n`);
    console.log('List of guilds for this application:');
    client.guilds.cache.forEach(guild => {
        console.log(`\t${guild.name} | ${guild.id}`);
    });
}

const TwitterBot = new Twit({
    consumer_key: process.env.API_KEY as string,
    consumer_secret: process.env.API_KEY_SECRET as string,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});


export default (client: CommandoClient) => {
    // startup & status messages
    startUpMessages(client);
    setInterval(setStatus, 10 * 60 * 1000);


    // register commands into client
    client.registry
        .registerDefaultTypes()
        .registerGroups([
            ['server', 'Server Function Commands'],
            ['emote', 'Emote and Reaction Commands'],
            ['wiki', 'Gem Wiki Information'],
        ])
        .registerDefaultGroups()
        .registerDefaultCommands()
        .registerCommandsIn({
            filter: /^([^.].*)\.(js|ts)$/,
            dirname: join(__dirname, '../commands/'),
        });

    // reaction roles: put unique messages into cache from each guild
    reactMessages.forEach(message => {
        const guildChannel = client.channels.cache.get(message.channel?.id!) as TextChannel;
        guildChannel.messages.fetch(message.id, true, false)
            .then(msg => console.log(`Successfully added message ${msg.id} (${message.name}) to cache from server ${msg.guild?.name} in channel ${(msg.channel as TextChannel).name}.`))
            .catch(console.error);
    });


    // twitter users: create streams to post content their specified Discord channels
    twitterUsers.forEach(twitterUser => {
        const stream = TwitterBot.stream('statuses/filter', { follow: twitterUser.id });
        stream.on('tweet', (tweet: any) => {
            // ignore users retweeting or quoting the tweet by OP
            if (tweet.retweeted_status || tweet.quoted_status) return;
            const url = join(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`);
            twitterUser.channels.forEach(channel => {
                try {
                    client.channels.fetch(channel.id).then(guildChannel => (guildChannel as TextChannel).send(url));
                }
                catch (error) {
                    console.log(error);
                }
            });
        });
        console.log(`Successfully created stream event for Twitter ID ${twitterUser.handle}`);
    });


    function setStatus(): void {
        // randomly choose a status type and then message
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        (client.user as ClientUser).setActivity(status.content, { type: status.id })
            .then(presence => console.log(`\nActivity set to '${presence.activities[0].type} ${presence.activities[0].name}'`))
            .catch(console.error);
    }
};
