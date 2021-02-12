// reactionroles.ts
import { EmbedGuild, EmbedMessage } from '../../interfaces/interfaces';
import { guildRinSolo } from '../../info/server/reception';
import { Collection } from 'discord.js';

const ReactionGuilds: EmbedGuild[] = [
  {
    id: '725009170839109682',
    name: "Rin's Solo Camp",
    channels: [
      {
        id: '779044446104059914',
        name: 'rules-and-info',
        messages: [],
      },
      {
        id: '804157684591886356',
        name: 'role-picker',
        messages: [guildRinSolo.embed?.get('access roles'), guildRinSolo.embed?.get('color roles')],
      },
    ],
  },
];

// but what the heck is this, its not even in a function
// link the parent to the child
ReactionGuilds.forEach((guild) => {
  guild.channels.forEach((channel) => {
    channel.guild = guild;
    channel.messages?.forEach((message) => {
      message.channel = channel;
      message.reactions?.forEach((emote) => {
        emote.message = message;
      });
    });
  });
});

function flatten<T>(initialArray: T[]): T[] {
  const newArray = ([] as T[]).concat(...initialArray);
  if (newArray.length === initialArray.length && newArray.every((value, index) => value === initialArray[index])) {
    return newArray;
  } else {
    return flatten(newArray);
  }
}

const reactMessages = flatten(
  ReactionGuilds.map((guild) => {
    return guild.channels.map((channel) => channel.messages);
  }),
);

const reactEmotes = flatten(
  ReactionGuilds.map((guild) => {
    return guild.channels.map((channel) => {
      return channel.messages.map((message) => {
        return message.reactions?.map((emote) => emote);
      });
    });
  }),
);

console.log(reactMessages, reactMessages.length);

export { ReactionGuilds as reactGuilds, reactMessages, reactEmotes };
