// ready.ts
import { join } from 'path';
import { twitterUsers } from '../info/server/twitterUsers';
import { Status, botStatuses } from '../info/botStatuses';
import { GuildMember, TextChannel } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { config } from 'dotenv';
import Twit = require('twit');
import { prefixAlt, homeguild, cinnabot, shinshaTest } from '../config.json';
import { prepareConnection } from '../db';
import { getConnection, getRepository } from 'typeorm';
import { Guild } from '../entity/Guild';

config({ path: join(__dirname, '../../process.env') });

const TwitterBot = new Twit({
  consumer_key: process.env.API_KEY as string,
  consumer_secret: process.env.API_KEY_SECRET as string,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

const checkCinnaBot = async (client: CommandoClient) => {
  const homeGuild = client.guilds.cache.get(homeguild);
  if (homeGuild == undefined || client.user == null) return;

  const CinnaBot = await homeGuild.members
    .fetch(cinnabot)
    .catch(() => console.log('An invalid user id was given for CinnaBot.'));
  if (!(CinnaBot instanceof GuildMember) || CinnaBot.user.presence.status == 'offline') return;

  if (client.user.id == shinshaTest) client.commandPrefix = prefixAlt;
};

const startUpMessages = async (client: CommandoClient) => {
  if (client.user == null) return console.log('The client has not been registered.');

  const guilds = client.guilds.cache.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  console.log(`\nLogged in as ${client.user.tag}! (${client.user.id})\n`);
  console.log('List of guilds for this application:');

  guilds.forEach((guild) => {
    console.log(`\t${guild.id} | ${guild}`);
  });
};

const createTwitterStreams = (client: CommandoClient) => {
  twitterUsers.forEach((twitterUser) => {
    const stream = TwitterBot.stream('statuses/filter', { follow: twitterUser.id });

    stream.on('tweet', (tweet: any) => {
      if (tweet.retweeted_status || tweet.quoted_status) return;

      const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
      twitterUser.channels.forEach((twitterChannel) => {
        client.channels
          .fetch(twitterChannel)
          .then((channel) => (channel as TextChannel).send(url))
          .catch((error) => console.log(`Failed to cache channel ${twitterChannel}: `, error));
      });
    });

    console.log(`Successfully created stream event for Twitter ID ${twitterUser.handle}`);
  });
};

const chooseActivity = (): Status => {
  const status = botStatuses[Math.floor(Math.random() * botStatuses.length)];
  return status;
};

export default async (client: CommandoClient) => {
  checkCinnaBot(client);

  startUpMessages(client);

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

  createTwitterStreams(client);

  setStatus();
  setInterval(setStatus, 10 * 60 * 1000);

  await prepareConnection();
  const conn = getConnection();
  const guildRepo = getRepository(Guild);
  const guildQuery = await guildRepo.createQueryBuilder('guild').getMany();
  const guildsNotInDB = client.guilds.cache.filter((g) => !guildQuery.some((guild) => guild.guildID == g.id));

  if (guildsNotInDB.size != 0) {
    guildsNotInDB.forEach((g) => {
      const guild = new Guild();
      guild.guildID = g.id;
      guild.guildName = g.name;
      guildRepo.save(guild);
    });
  }

  function setStatus() {
    const status = chooseActivity();
    if (client.user == null) return console.log('The client has not been registered.');
    client.user
      .setActivity(status.activity, { type: status.id })
      .then((presence) =>
        console.log(`\nActivity set to '${presence.activities[0].type} ${presence.activities[0].name}'`),
      )
      .catch((error) => console.log('Failed to set activity: ', error));
  }
};
