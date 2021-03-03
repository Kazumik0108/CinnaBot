import { stripIndents } from 'common-tags';
import { HEX_REGEX } from '../../lib/types/common/regex';
import { HEX_SHORT_TO_LONG_REGEX } from '../../lib/utils/regexFilters';

export const EmbedMessageFieldsPrompt = () => stripIndents`
  Specify the fields of the embed message, or \`next\` to use none. Field values may span multiple lines. Use the key phrases below to separate field arguments and different fields. Omitting the argument \`inline\` will default it to \`FALSE\`.
  \`\`\`
  > field name: <name> value: <value> inline: <boolean>

  ---EXAMPLE---
  > field name: Hoisted value: FALSE inline: true
  > field name: Permissions value: ADD_REACTIONS
  > ATTACH_FILES
  > CONNECT
  > inline: false
  \`\`\``;

// interface MessageContents {
//   content: string;
//   embed: MessageEmbed[];
// }

// export const MESSAGE_EMBED_KEYS = Object.keys(new MessageEmbed());

// export const hexColorValidator = (color: string): boolean => {
//   const matches = color.match(HEX_REGEX);
//   return matches != null ? true : false;
// };

export const hexColorParser = (color: string): string | null => {
  const matches = color.match(HEX_REGEX);
  if (matches == null) return null;

  const colorInput = matches[0];
  if (colorInput.length == 7) return colorInput;

  return convertShortToLongHexColor(colorInput);
};

const replaceShortToLongHexColor = (substring: string): string => {
  return substring.concat(substring);
};

export const convertShortToLongHexColor = (colorShort: string): string => {
  return colorShort.replace(HEX_SHORT_TO_LONG_REGEX, replaceShortToLongHexColor);
};

// export const convertDecimalToHexColor = (decimal: number) => {
//   let hex = decimal.toString(16).toUpperCase();
//   while (hex.length < 6) {
//     hex = '0'.concat(hex);
//   }
//   return hex.startsWith('#') ? hex : '#'.concat(hex);
// };

// export const convertHexToDecimalColor = (hex: string) => {
//   const decimal = hex.startsWith('#') ? parseInt(hex.slice(1), 16) : parseInt(hex, 16);
//   return decimal;
// };

// export const hintEmbedMessage = async (message: CommandoMessage) => {
//   const user = message.author;
//   const guild = message.guild;
//   const guildEmote = guild.emojis.cache.first() ?? (('👍' as unknown) as GuildEmoji);
//   const guildRole = guild.roles.cache.first() ?? (('@everyone' as unknown) as Role);
//   const guildChannel =
//     guild.channels.cache.filter((channel) => channel instanceof TextChannel).first() ??
//     (('#general' as unknown) as TextChannel);

//   const hintMessage: MessageContents = {
//     content: 'Edit the contents of the embed message using the following arguments:',
//     embed: [
//       new MessageEmbed()
//         .setTitle('author')
//         .setDescription(
//           'This argument accepts user pings to fill both the author and icon fields and as separate arguments.',
//         )
//         .addFields([
//           {
//             name: 'Passing in a user',
//             value: stripIndents`
//             The user must be input as if they were to be pinged, e.g. ${user}, and then enclosed in backticks. This will display their name and ID as inline code and prevent them from receiving a notification. For example, passing in ${user} as an author will be input as:
//             > author @\`${user.tag}\`
//             `,
//           },
//           {
//             name: 'Passing in separate arguments',
//             value: stripIndents`
//             The author name is simply preceded by the keyword "author".
//             > author Example author name

//             The author icon URL is preceded by the keywords "author icon" and must be a valid URL to an image in your browser. To prevent an image preview, the URL may also be enclosed by the arrow tags <>.
//             > author icon <${user.displayAvatarURL()}>
//             `,
//           },
//           {
//             name: 'Removing the author',
//             value: stripIndents`
//             The author name and icon can removed by entering 0 as the only input.
//             > author 0
//             `,
//           },
//         ]),

//       new MessageEmbed()
//         .setTitle('color')
//         .setDescription(
//           'This argument accepts short and long hex color codes. This value is the sidebar color of the embed message and is black (#000000) by default.',
//         )
//         .addFields([
//           {
//             name: 'Passing in a long hex code',
//             value: stripIndents`
//             A valid hex code is between #000000 and #ffffff (case-insensitive).
//             **The hash symbol # is required for this argument**
//             > color #aaccff
//             `,
//           },
//           {
//             name: 'Passing in a short hex code',
//             value: stripIndents`
//             A short hex code will automatically be converted to its long form. For example, #25e is equivalent to #2255ee.
//             > color #25e
//             `,
//           },
//         ]),

//       new MessageEmbed()
//         .setTitle('description')
//         .setDescription(
//           stripIndents`
//           This argument accepts multi-line inputs and may utilize Discord's Markdown text formatting styles. **Setting a new description will always replace the current description in the embed message.**
//           `,
//         )
//         .addFields([
//           {
//             name: 'Passing in formatted text',
//             value: stripIndents`
//             The input text can be formatted as if it were a regular message.
//             >>> **Bold text** with *italics* and __underlined__ words, then ***__combined together__***.
//             \`In-line code\` with
//             \`\`\`
//             Multi-line code block.
//             \`\`\`
//             `,
//           },
//           {
//             name: 'Passing in users, roles, and channels',
//             value: stripIndents`
//             Users and roles must be previewed as a ping and then enclosed in backticks, even if they are not pingable in the current channel.
//             > ${user} is the original author.
//             > ${guildRole} is a role in ${guild}.

//             Channels must be previewed as a clickable-link. If the author does not have viewing access to the channel, the channel will not display properly.
//             > ${guildChannel} is a channel in ${guild}.
//             `,
//           },
//           {
//             name: 'Passing in emotes',
//             value: stripIndents`
//             To display the emote properly, **the bot must have access to the server where the emote is uploaded.** Otherwise, it will display as an unformatted string.

//             Regardless of the description contents, the emote will be displayed tiny as if it were inline with text.
//             > description The emote ${guildEmote} is inline with text.
//             `,
//           },
//         ]),

//       new MessageEmbed().setTitle('footer').setDescription(
//         stripIndents`
//           You may also specify a user, along with other text, in the footer to use their nickname and profile picture, or specify a description and image separately.
//           > footer \`@${user.tag}\`

//           Alternatively, you may specify the description and icon separately.
//           > footer Example footer.
//           > footer icon ${user.displayAvatarURL()}
//           `,
//       ),

//       new MessageEmbed().setTitle('title').setDescription(stripIndents`
//           This argument accepts multi-line string inputs and can be formatted similar to a description, with few exceptions.

//           - Users, roles, and channels will be displayed as if escaped, instead of as pings or links.
//           - Multi-line code behave as inline code and will not display properly.
//           > title **This is __my__ title** ${guildEmote}
//         `),

//       new MessageEmbed()
//         .setTitle('fields')
//         .setDescription(
//           stripIndents`
//           This argument allows you to add, delete, or edit a field in the embed message. A field takes in a \`name: <name> value: <value> inline: <true/false>\` parameter list and must be updated individually. The \`<position>\` of a field is counted left-to-right, then top-to-bottom, taking 0 to be the first field position.

//           **New lines may be used to separate the inputs. White spaces will automatically get trimmed at both ends of the inputs.**

//           - The \`name\` parameter follows the same formatting rules as a title.
//           - The \`value\` parameter follows the same formatting rules as a description.
//           - The \`inline\` parameter takes \`true\` or \`false\` as inputs. At least two adjacent fields must have their \`inline\` parameter set to \`true\` to be inline. If omitted, this parameter defaults to \`false\`.
//           `,
//         )
//         .addFields([
//           {
//             name: 'Adding a field',
//             value: stripIndents`
//               The keywords \`field add <position>\` must be used to add a field. The \`<position\`> parameter is the location to insert the new field. If omitted, the field will automatically be added at the end.

//               > field add 2 name: Field name value: Field value inline: true

//               >>> field add 2
//               name: Field name
//               value: Field value
//               inline: true
//               `,
//           },
//           {
//             name: 'Deleting a field',
//             value: stripIndents`
//             The keywords \`field del <position>\` must be used to delete a field. The \`<position\`> parameter is the location of the field to delete. If omitted, the field will delete the first field and shift all fields left or up, while remembering their inline values.

//             > field del 2
//             `,
//           },
//           {
//             name: 'Editing a field',
//             value: stripIndents`
//             The keywords \`field edit <position>\` must be used to edit a field. The \`<position\`> parameter is the location of the field to edit. If omitted, this command will not do anything. Only the edited parameter names should be specified, or else the contents will be overwritten.

//             > field edit 2 name: Edited field name inline: true

//             >>> field edit 2
//             name: Edited field name
//             value: Edited field value
//             `,
//           },
//         ]),
//     ],
//   };

//   hintMessage.embed.forEach((embed, index) => {
//     embed
//       .setAuthor(user.username, user.displayAvatarURL())
//       .setColor('#aaccff')
//       .setFooter(`Page ${index + 1}/${hintMessage.embed.length}`);
//   });

//   const options: ReactionOptionsBackNext = {
//     first: '⏪',
//     back: '◀️',
//     next: '▶️',
//     last: '⏩',
//   };

//   const hintReactMessage = await message.say(hintMessage.content, hintMessage.embed[0]);
//   for (const reaction of Object.values(options) as string[]) {
//     hintReactMessage.react(reaction);
//   }

//   const filter = (collectReaction: MessageReaction, collectUser: User) =>
//     reactionOptionsFilter(message, options, collectReaction, collectUser);

//   const collector = hintReactMessage.createReactionCollector(filter, { time: 15 * 1000 });

//   collector.on('collect', (collectReaction: MessageReaction, collectUser: User) => {
//     collector.resetTimer({ time: 30 * 1000 });
//     let embedEdit = hintReactMessage.embeds[0];
//     if (collectReaction.emoji.toString() == options.first) {
//       embedEdit = hintMessage.embed[0];
//     } else if (collectReaction.emoji.toString() == options.last) {
//       embedEdit = hintMessage.embed[hintMessage.embed.length - 1];
//     } else {
//       const footer = embedEdit.footer;
//       if (footer == null || footer.text == undefined) return;
//       const match = footer.text.match(/(?<=Page )\d+(?=\/\d)/);
//       if (match == null) return;

//       const pageNum = parseInt(match[0], 10);
//       const index = pageNum - 1;
//       if (collectReaction.emoji.toString() == options.back && pageNum != 1) {
//         embedEdit = hintMessage.embed[index - 1];
//       } else if (collectReaction.emoji.toString() == options.next && pageNum != hintMessage.embed.length) {
//         embedEdit = hintMessage.embed[index + 1];
//       }
//     }
//     hintReactMessage.edit(embedEdit);
//     collectReaction.users.remove(collectUser.id);
//   });
// };

// export const editEmbedMessage = async (
//   message: CommandoMessage,
//   messageEmbed: CommandoMessage,
//   parentCollector?: MessageCollector | ReactionCollector,
// ) => {
//   const embedEdit = messageEmbed.embeds[0];

//   const options: MessageOptions = {
//     args: MESSAGE_EMBED_KEYS,
//   };
//   const filter = (msg: CommandoMessage) => messageOptionsFilter(options, msg);
//   const collector = message.channel.createMessageCollector(filter, { time: 30 * 1000 });

//   collector.on('collect', (collect: CommandoMessage) => {
//     if (parentCollector != undefined) parentCollector.resetTimer({ time: 20 * 1000 });

//     const parse = collect.content.split(/ +/);
//     const arg = parse.slice(0, 1).join('').toLowerCase();
//     const content = parse.slice(1).join(' ');

//     switch (arg) {
//       case 'author': {
//         const author: MessageEmbedAuthor = embedEdit.author ?? {
//           name: '',
//           iconURL: '',
//           url: '',
//         };

//         const userMatch = content.replace('!', '').match(ID_USER_REGEX);
//         if (userMatch != null) {
//           const guildMember = getGuildMember(userMatch[0], message);
//           if (guildMember != null) {
//             author.name = guildMember.displayName;
//             author.iconURL = guildMember.user.displayAvatarURL();
//           }
//         } else {
//           const splits = content.split(/ +/);

//           author.name = splits[0];
//           if (splits.length > 1) {
//             author.iconURL = splits[1];
//           }
//           if (splits.length > 2) {
//             author.url = splits[2];
//           }
//         }
//         embedEdit.setAuthor(author.name, author.iconURL, author.url);
//         break;
//       }

//       case 'color': {
//         const color = hexColorParser(content);
//         if (color != null) {
//           embedEdit.setColor(color);
//         }
//         break;
//       }

//       case 'description': {
//         embedEdit.setDescription(content);
//         break;
//       }

//       case 'footer': {
//         embedEdit.setFooter(content);
//         break;
//       }

//       // case 'image': {
//       //   embedEdit.setImage(content);
//       //   break;
//       // }

//       // case 'thumbnail': {
//       //   embedEdit.setThumbnail(content);
//       //   break;
//       // }

//       // case 'timestamp': {
//       //   embedEdit.setTimestamp(new Date());
//       //   break;
//       // }

//       case 'title': {
//         embedEdit.setTitle(content);
//         break;
//       }

//       // case 'url': {
//       //   embedEdit.setURL(content);
//       // }
//     }

//     messageEmbed.edit(embedEdit);
//     collector.resetTimer();
//   });

//   collector.on('end', (collected) => {
//     console.log(collected);
//   });

//   return;
// };
