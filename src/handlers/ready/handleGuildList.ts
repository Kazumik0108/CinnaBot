import { CommandoClient } from 'discord.js-commando';

export const handleGuildList = async (client: CommandoClient) => {
  const guilds = client.guilds.cache.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  console.log('\nList of guilds for this applications:');
  for (const guild of guilds.values()) {
    console.log(`\t${guild.id} | ${guild}`);
  }
};
