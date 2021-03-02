import { ClientUser, GuildMember } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';

import { cinnabot, homeguild, prefix, prefixAlt, shinshaTest } from '../../config.json';

export const handleTestBot = async (client: CommandoClient, user: ClientUser) => {
  const homeGuild = client.guilds.cache.get(homeguild);
  if (homeGuild == undefined) return;

  const CinnaBot = await homeGuild.members
    .fetch(cinnabot)
    .catch((error) => console.log(`An error has occurred fetching this user: ${error}`));

  if (!(CinnaBot instanceof GuildMember) || CinnaBot.user.presence.status == 'offline') return;
  if (user.id == shinshaTest) {
    client.commandPrefix = prefixAlt;
    console.log(`The prefix for ${user.tag} has been changed from ${prefix} to ${prefixAlt}`);
  }
};
