import { CommandoClient } from 'discord.js-commando';

export const handleClientUser = (client: CommandoClient) => {
  if (client.user == null) {
    console.log('The client user has not been registered.');
    return null;
  }
  return client.user;
};
