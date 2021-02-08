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
                        `${Array.from(embedGuilds.get('725009170839109682')!.embed.keys()).join('\n')}` +
                        '```',
                    type: 'string',
                },
            ],
        });
    }

    async run(message: CommandoMessage, { name }: promptArgs): Promise<null> {
        // Abort command if there are no embed messages made for the message server
        if (embedGuilds.has((message.guild as Guild).id)) {
            Promise.resolve(embedGuilds.get((message.guild as Guild).id))
                .then(embedGuild => {
                    // Attempt to send an embed message if the input name is valid
                    if (embedGuild?.embed.has(name)) {
                        const reactMessage = embedGuilds.get('725009170839109682')!.embed.get(name);
                        message.say(reactMessage?.embed)
                            .then(msg => {
                                if (reactMessage?.reactions) {
                                    reactMessage?.reactions.forEach(reaction => {
                                        msg.react(message.client.emojis.cache.get(reaction.id) as EmojiIdentifierResolvable);
                                    });
                                }
                            });
                    }
                    else {
                        message.say(`${name} is not a valid embed message name.`)
                            .then(invalidMsg => invalidMsg.delete({ timeout: 5000 }));
                    }

                    message.delete({ timeout: 5000 });
                });
        }
        else {
            message.say(`There are no pre-formatted embed messages in ${message.guild?.name}`)
                .then(guildMsg => guildMsg.delete({ timeout: 5000 }));
        }


        return null;
    }
}