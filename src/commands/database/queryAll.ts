// import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
// import { Channel, Guild, Reaction, ReactionRole } from '../../entity';
// import { handleConnection } from '../../handlers/database/handleConnection';
// import { handleQueryAll } from '../../handlers/database/handleQueryAll';
// import { handleQueryEmbed } from '../../handlers/database/handleQueryEmbed';
// import { ENTITY_GUILD_INPUTS as ENTITY_INPUTS } from '../../lib/common/constants';
// import { Entity, EntityInput } from '../../lib/common/types';

// interface PromptArgs {
//   entity: Entity;
// }

// export default class queryAll extends Command {
//   constructor(client: CommandoClient) {
//     super(client, {
//       name: 'queryall',
//       aliases: ['qall'],
//       memberName: 'queryall',
//       group: 'database',
//       description: 'Select all rows of a specified entities table from the database',
//       args: [
//         {
//           key: 'entity',
//           prompt: 'specify the entity table to select rows from.',
//           type: 'string',
//           oneOf: ENTITY_INPUTS,
//           parse: (string: string) => {
//             const input = string.toLowerCase() as EntityInput;
//             switch (input) {
//               case 'channel':
//                 return Channel;
//               case 'guild':
//                 return Guild;
//               case 'reaction':
//                 return Reaction;
//               case 'role':
//                 return ReactionRole;
//               default:
//                 return null;
//             }
//           },
//         },
//       ],
//     });
//   }

//   async run(message: CommandoMessage, { entity }: PromptArgs) {
//     const conn = await handleConnection();
//     const queries = await handleQueryAll(conn, entity);
//     const embed = await handleQueryEmbed(message, conn, entity, queries);

//     if (embed == null) {
//       message.reply(`no values have been entered into database table ${entity.name}.`);
//       return null;
//     }

//     message.embed(embed);
//     return null;
//   }
// }
