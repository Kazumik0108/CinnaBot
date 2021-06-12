import { Guild } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { Connection } from 'typeorm';
import { Entities } from '../common/enums';
import { registerOne } from './register';

export async function registerGuildOnValidate(conn: Connection, message: CommandoMessage, guild: Guild) {
  await message.say(`${guild} is not registered! Adding to the database ...`);
  try {
    await registerOne({ conn: conn, guild: guild, entity: Entities.Guild });
    await message.say(`${guild} was successfully registered!`);
  } catch (e) {
    await message.say(`There was an error adding ${guild} to the database.`);
    console.log('An error occurred adding a guild to the database:', e);
  }
}
