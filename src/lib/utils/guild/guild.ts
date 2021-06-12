import { Client } from 'discord.js';

export const getGuild = (property: string, client: Client) => {
  const guild = client.guilds.cache.find((g) => g.id == property || g.name == property);
  return guild != undefined ? guild : null;
};
