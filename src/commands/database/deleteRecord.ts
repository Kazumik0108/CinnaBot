// import { MessageEmbed } from 'discord.js';
// import { CommandoMessage } from 'discord.js-commando';
// import { Channel } from '../../entity';
// import { ConnectionClient, ConnectionCommand } from '../../lib/common/classes';

// export default class deleteRecord extends ConnectionCommand {
//   constructor(client: ConnectionClient) {
//     super(client, {
//       name: 'deleterecord',
//       aliases: ['drecord', 'dr'],
//       group: 'database',
//       memberName: 'deleterecord',
//       description: "Deletes a channel from the guild's database",
//       guildOnly: true,
//       userPermissions: ['MANAGE_MESSAGES'],
//     });
//   }

//   async run(message: CommandoMessage) {
//     const conn = this.client.conn;
//     const query = await conn
//       .getRepository(Channel)
//       .createQueryBuilder('c')
//       .where('c.guildId = :id', { id: message.guild.id })
//       .getMany();

//     if (query.length == 0) {
//       message.say('There are no channels registered for this guild.');
//       return null;
//     }

//     const id: string[] = [];
//     const names: string[] = [];
//     for (let i = 0; i < query.length; i++) {
//       id.push(i.toString());
//       names.push(query[i].getChannel(message.guild).toString());
//     }
//     const embed = new MessageEmbed()
//       .setTitle('Delete Channels')
//       .setThumbnail(message.guild.iconURL() as string)
//       .setDescription(message.guild.name)
//       .addFields([
//         { name: 'id', value: id.concat('\n'), inline: true },
//         {
//           name: 'channels',
//           value: names.concat('\n'),
//           inline: true,
//         },
//       ]);
//     message.say(embed);

//     return null;
//   }
// }
