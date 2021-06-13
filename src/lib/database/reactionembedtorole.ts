// const getReactionEmbed = async (message: CommandoMessage, conn: Connection) => {
//   const embeds = await conn
//     .getRepository(Embed)
//     .createQueryBuilder('e')
//     .leftJoinAndSelect('e.guild', 'guild')
//     .where('e.guild = :guild', { guild: message.guild.id })
//     .getMany();

//   if (embeds.length == 0) {
//     message.reply(
//       'There are no embed messages registered to the database. Register an embed message before using this command again.',
//     );
//     return null;
//   }

//   const titles = embeds.map((e) => e.title);

//   message.say(stripIndents`
//     ${titles.length} embed messages are registered to ${message.guild}. Specify the embed message to link the reaction:
//     \`\`\`
//     ${titles.join('\n')}
//     \`\`\`
//     `);

//   const filter = (m: Message) => {
//     const isAuthor = m.author == message.author;
//     if (!isAuthor) return false;

//     const isOneOf = titles.includes(m.content);
//     if (!isOneOf) message.say('Invalid title.');
//     return isOneOf;
//   };
//   const title = (await message.channel.awaitMessages(filter, { time: 15 * 1000, max: 1 })).first();

//   if (title == undefined) {
//     message.say('No valid titles were given. Try the command again.');
//     return;
//   }

//   return embeds.find((e) => e.title == title.content);
// };

// const getReactionRole = async (message: CommandoMessage, conn: Connection) => {
//   const roles = await conn
//     .getRepository(ReactionRole)
//     .createQueryBuilder('r')
//     .leftJoinAndSelect('r.guild', 'guild')
//     .where('r.guild = :guild', { guild: message.guild.id })
//     .getMany();

//   if (roles.length == 0) {
//     message.say('There are no roles registered to the database. Register a role before using this command again.');
//     return null;
//   }

//   const names = roles.map((e) => e.name);

//   message.say(stripIndents`
//     ${names.length} roles are registered to ${message.guild}. Specify the role to link the reaction:
//     \`\`\`
//     ${names.join('\n')}
//     \`\`\`
//     `);

//   const filter = (m: Message) => {
//     const isAuthor = m.author == message.author;
//     if (!isAuthor) return false;

//     const isOneOf = names.includes(m.content);
//     if (!isOneOf) message.say('Invalid name.');
//     return isOneOf;
//   };
//   const name = (await message.channel.awaitMessages(filter, { time: 15 * 1000, max: 1 })).first();

//   if (name == undefined) {
//     message.say('No valid names were given. Try the command again.');
//     return;
//   }

//   return roles.find((r) => r.name == name.content);
// };
