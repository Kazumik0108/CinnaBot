// reactionroles.ts
interface reactEntity {
    id: string;
    name?: string;
}

interface reactEmote extends reactEntity {
    roleID: string;
    roleName?: string;
    message?: reactMessage;
}

interface reactMessage extends reactEntity {
    reactions: Array<reactEmote>;
    channel?: reactChannel;
}

interface reactChannel extends reactEntity {
    messages?: Array<reactMessage>;
    guild?: reactGuild;
}

interface reactGuild extends reactEntity {
    channels: Array<reactChannel>;
}

// Allow upwards-linking of the parent to the children by defining in steps
// Servers
const reactGuilds: Array<reactGuild> = [
    {
        id: '725009170839109682',
        name: 'Rin\'s Solo Camp',
        channels: [
            {
                id: '779044446104059914',
                name: 'rules-and-info',
                messages: [
                    {
                        id: '804187136793378847',
                        name: 'rules',
                        reactions: [
                            {
                                id: '725037351486881824',
                                name: 'RinIcon',
                                roleID: '747124541259776030',
                                roleName: 'Rin Simp',
                            },
                        ],
                    },
                ],
            },
            {
                id: '804157684591886356',
                name: 'role-picker',
                messages: [
                    {
                        id: '804196628067647498',
                        name: 'access roles',
                        reactions: [
                            {
                                id: '745677254696370266',
                                name: 'RinPinged',
                                roleID: '796073053662216242',
                                roleName: 'Rin Twitter',
                            },
                            {
                                id: '725059880771125339',
                                name: 'RinRelax',
                                roleID: '779068605433118780',
                                roleName: 'DJ',
                            },
                        ],
                    },
                    {
                        id: '804196628515782677',
                        name: 'color roles',
                        reactions: [
                            {
                                id: '803862924950110210',
                                roleID: '779064341407858698',
                                roleName: 'Blue',
                            },
                            {
                                id: '803862924966756374',
                                roleID: '779064270893613086',
                                roleName: 'Cyan',
                            },
                            {
                                id: '803862925411745802',
                                roleID: '779063968194494474',
                                roleName: 'Light Green',
                            },
                            {
                                id: '803862924992053249',
                                roleID: '779064181403811861',
                                roleName: 'Dark Green',
                            },
                            {
                                id: '803862925122338858',
                                roleID: '779064071780696074',
                                roleName: 'Yellow',
                            },
                            {
                                id: '803862925277265950',
                                roleID: '779065017609879593',
                                roleName: 'Tan',
                            },
                            {
                                id: '803862925269794857',
                                roleID: '779064295312719892',
                                roleName: 'Orange',
                            },
                            {
                                id: '803862925219332106',
                                roleID: '779064099760898078',
                                roleName: 'Red',
                            },
                            {
                                id: '803862924875661333',
                                roleID: '779064227620192277',
                                roleName: 'Pink',
                            },
                            {
                                id: '803862925176602665',
                                roleID: '779065535987056680',
                                roleName: 'Lavender',
                            },
                            {
                                id: '803862925000441897',
                                roleID: '779064248188928001',
                                roleName: 'Purple',
                            },
                            {
                                id: '803862925273464862',
                                roleID: '779064145378017310',
                                roleName: 'Violet',
                            },
                        ],
                    },
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
            message.reactions.forEach(emote => {
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
const reactEmotes: Array<reactEmote> = flatten(reactGuilds.map(guild => guild.channels.map(channel => channel.messages?.map(message => message.reactions.map(emote => emote)))));

// get all unique messages used for reactions
const reactMessages: Array<reactMessage> = flatten(reactGuilds.map(guild => guild.channels.map(channel => channel.messages)));


export { reactChannel, reactGuilds, reactMessages, reactEmotes };