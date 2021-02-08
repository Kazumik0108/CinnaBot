// gem.ts
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { gems } from '../../info/gems';

interface promptArgs {
    names: string,
}


export default class gemInfo extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'gem',
            group: 'wiki',
            memberName: 'gem',
            description: 'Sends the information for the specified gem',
            guildOnly: true,
            userPermissions: ['MANAGE_MESSAGES'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'names',
                    prompt: 'Which gem(s) would you to see? Separate names with a space.\n' +
                        '```\n' +
                        Array.from(gems.keys()).join('\n') +
                        '```',
                    type: 'string',
                },
            ],
        });
    }


    async run(message: CommandoMessage, { names }: promptArgs): Promise<null> {
        // get all of the arguments from the names input, removing duplicates
        const args = Array.from(new Set(names.toLowerCase().trim().split(/ +/)));

        // attempt to send an embed for each name input
        args.forEach(name => {
            if (gems.has(name.toLowerCase())) {
                message.say(gems.get(name.toLowerCase()));
            }
            else {
                message.reply(`there are no gems with the name \`${name}\`.`)
                    .then(reply => reply.delete({ timeout: 5000 }));
            }
        });


        return null;
    }
}