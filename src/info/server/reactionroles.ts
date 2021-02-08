// reactionroles.ts
import { reactGuild, reactMessage, reactEmote } from '../../interfaces/reactInterface';
import { embedGuilds } from '../../embed/reception';


const reactGuilds: reactGuild[] = [
    {
        id: '725009170839109682',
        name: 'Rin\'s Solo Camp',
        channels: [
            {
                id: '779044446104059914',
                name: 'rules-and-info',
                messages: [
                    embedGuilds[0].embed.get('rules')!,
                ],
            },
            {
                id: '804157684591886356',
                name: 'role-picker',
                messages: [
                    embedGuilds[0].embed.get('access roles')!,
                    embedGuilds[0].embed.get('color roles')!,
                ],
            },
        ],
    },
];


// link the parent to the child
reactGuilds.forEach(guild => {
    guild.channels.forEach(channel => {
        channel.guild = guild;
        channel.messages?.forEach(message => {
            message.channel = channel;
            message.reactions!.forEach(emote => {
                emote.message = message;
            });
        });
    });
});


const flatten = (initialArray: Array<any>): Array<any> => {
    // Flatten array elements into one long array
    const newArray = [].concat(...initialArray);
    if (newArray.length === initialArray.length && newArray.every((value, index) => value === initialArray[index])) {
        return newArray;
    }
    else {
        return flatten(newArray);
    }
};

// get all emote objects used for reactions
const reactEmotes: reactEmote[] = flatten(reactGuilds.map(guild => guild.channels.map(channel => channel.messages?.map(message => message.reactions!.map(emote => emote)))));

// get all unique messages used for reactions
const reactMessages: reactMessage[] = flatten(reactGuilds.map(guild => guild.channels.map(channel => channel.messages)));


export { reactGuilds, reactMessages, reactEmotes };