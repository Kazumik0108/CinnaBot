// embed.ts
import { EmojiIdentifierResolvable, Guild } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { embedGuilds } from '../../info/server/reception';


interface promptArgs {
    name: string
}


export default class embedPreFormatted extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'embed',
            group: 'server',
            memberName: 'embed',
            description: 'Send a pre-formatted embed message to the channel',
            examples: ['+embed'],
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES'],
            userPermissions: ['MANAGE_CHANNELS'],
            args: [
                {
                    key: 'name',
                    prompt: 'Enter the embedded message name to display. Send one argument at a time. The available options are:\n' +
                        '```\n' +
                        `${embedGuilds[0].embed.map(msg => msg.name).join('\n')}` +
                        '```',
                    type: 'string',
                },
            ],
        });
    }

    async run(message: CommandoMessage, { name }: promptArgs): Promise<null> {
        // Abort command if there are no embed messages made for the message server
        if (embedGuilds.some(embedGuild => embedGuild.id === (message.guild as Guild).id)) {
            Promise.resolve(embedGuilds.find(embedGuild => embedGuild.id === (message.guild as Guild).id))
                // Attempt to send an embed message if the input name is valid
                .then(embedGuild => {
                    if (embedGuild?.embed.some(reactMessage => reactMessage.name === name)) {
                        return embedGuild?.embed.find(reactMessage => reactMessage.name === name);
                    }
                    else {
                        message.say(`${name} is not a valid embed message name.`)
                            .then(invalidMsg => invalidMsg.delete({ timeout: 5000 }));
                        return;
                    }
                })
                // If an embed message was sent, add reactions if they are available
                .then(reactMessage => {
                    if (reactMessage) {
                        message.say(reactMessage.embed)
                            .then(msg => {
                                if (reactMessage?.reactions) {
                                    reactMessage?.reactions.forEach(reaction => {
                                        msg.react(message.client.emojis.cache.get(reaction.id) as EmojiIdentifierResolvable);
                                    });
                                }
                            });
                    }
                    else {
                        return;
                    }
                });
        }
        else {
            message.say(`There are no pre-formatted embed messages in ${message.guild?.name}`)
                .then(guildMsg => guildMsg.delete({ timeout: 5000 }));
        }


        return null;
    }
}