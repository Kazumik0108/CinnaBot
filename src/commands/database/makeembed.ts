// /* eslint-disable no-shadow */
// import { GuildChannel, MessageEmbed, MessageReaction, TextChannel, User } from 'discord.js';
// import { CommandoMessage } from 'discord.js-commando';
// import { Connection } from 'typeorm';
// import { handleEmbedInputs } from '../../handlers/embed/handleEmbedInputs';
// import { ConnectionClient, ConnectionCommand } from '../../lib/common/classes';
// import { registerEmbed } from '../../lib/database/register';
// import { sleep } from '../../lib/utils/collector/sleep';
// import { getGuildChannel, isTextChannel, validateGuildChannel } from '../../lib/utils/guild/channel';

// interface PromptArgs {
//   channel: TextChannel;
// }

// enum Reaction {
//   yes = '✅',
//   no = '❌',
// }

// const save = '💾';

// export default class makeEmbed extends ConnectionCommand {
//   constructor(client: ConnectionClient) {
//     super(client, {
//       name: 'makeembed',
//       aliases: ['membed', 'me'],
//       group: 'database',
//       memberName: 'makeembed',
//       description:
//         'Creates and sends an embed message to a channel within the server, with the option to register it to the database.',
//       guildOnly: true,
//       clientPermissions: ['MANAGE_MESSAGES'],
//       userPermissions: ['MANAGE_MESSAGES'],
//       args: [
//         {
//           key: 'channel',
//           prompt: 'Specify the target text channel for the embed message.',
//           type: 'string',
//           validate: (input: string, m: CommandoMessage) => {
//             if (!validateGuildChannel(input, m.guild)) return false;
//             const channel = getGuildChannel(input, m.guild) as GuildChannel;
//             return isTextChannel(channel);
//           },
//           parse: (input: string, m: CommandoMessage) => {
//             const channel = getGuildChannel(input, m.guild) as TextChannel;
//             return channel;
//           },
//         },
//       ],
//     });
//   }

//   async run(message: CommandoMessage, { channel }: PromptArgs) {
//     const embed = await handleEmbedInputs(message);
//     await sendEmbed(message, channel, embed);
//     await saveEmbed(this.client.conn, message, channel, embed);
//     return null;
//   }
// }

// async function sendEmbed(message: CommandoMessage, channel: TextChannel, embed: MessageEmbed) {
//   const msg = await message.say(
//     `React with ${Reaction.yes} to send the embed to ${channel} or ${Reaction.no} to cancel the command.`,
//     embed,
//   );

//   for (const reaction of Object.values(Reaction)) await msg.react(reaction);

//   const collector = msg.createReactionCollector(
//     (reaction: MessageReaction, user: User) => filter(message.author, reaction, user),
//     {
//       time: 30 * 1000,
//       maxEmojis: 1,
//     },
//   );

//   collector.on('collect', (reaction: MessageReaction) => {
//     switch (reaction.emoji.name) {
//       case Reaction.yes:
//         channel.send(embed).then(() => message.reply(`Embed successfuly sent to ${channel}.`));
//         break;
//       case Reaction.no:
//         message.reply('Canceling the command.');
//         break;
//     }
//     collector.stop();
//   });

//   while (!collector.ended) await sleep(1 * 1000);
// }

// async function saveEmbed(conn: Connection, message: CommandoMessage, channel: TextChannel, embed: MessageEmbed) {
//   const msg = await message.say(`React with ${save} to save the embed to ${message.guild}.`);
//   await msg.react(save);

//   const collector = msg.createReactionCollector(
//     (reaction: MessageReaction, user: User) => filterSave(message.author, reaction, user),
//     {
//       time: 30 * 1000,
//       maxEmojis: 1,
//     },
//   );

//   collector.on('collect', async () => {
//     await registerEmbed(conn, embed, channel);
//     collector.stop();
//   });
// }

// function filter(author: User, reaction: MessageReaction, user: User) {
//   if (author != user) return false;
//   if (!Object.values(Reaction).some((r) => reaction.emoji.name == r && reaction.emoji.id == null)) {
//     reaction.remove();
//     return false;
//   }
//   return true;
// }

// function filterSave(author: User, reaction: MessageReaction, user: User) {
//   if (author != user) return false;
//   if (reaction.emoji.name != save && reaction.emoji.id == null) {
//     reaction.remove();
//     return false;
//   }
//   return true;
// }
