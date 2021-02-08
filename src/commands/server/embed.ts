// embed.ts
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { embedGuilds } from '../../embed/reception';


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
                        `${Array.from(embedGuilds[0].embed.keys())}` +
                        '```',
                    type: 'string',
                },
            ],
        });
    }

    async run(message: CommandoMessage, { name }: promptArgs): Promise<null> {
        // Get the first word argument from the name
        const input = name.split(/ +/)[0];

        // attempt to send the embed if the input is a valid name type
        if (embedGuilds[0].embed.has(input)) {
            message.say(embedGuilds[0].embed.get(input));
        }
        else {
            message.say(`${input} is not a valid embed message name.`)
                .then(msg => msg.delete({ timeout: 5000 }));
        }


        return null;
    }
}