// emitadd.ts
import { GuildMember } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';


module.exports = class emitadd extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'emitadd',
            group: 'server',
            memberName: 'emitadd',
            description: 'Emits the guildMemberAdd event to the client in the messaged server.',
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES'],
            userPermissions: ['MANAGE_CHANNELS'],
        });
    }

    async run(message: CommandoMessage): Promise<null> {
        message.client.emit('guildMemberAdd', (message.member as GuildMember));
        return null;
    }
};