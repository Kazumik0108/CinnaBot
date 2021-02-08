// welcome.ts
import { Collection, MessageEmbed } from 'discord.js';


interface welcomeGuild {
    id: string,
    name?: string,
    welcomeChannelID: string,
    logChannelID?: string,
    welcome: MessageEmbed,
}


export const welcomeGuilds: Collection<string, welcomeGuild> = new Collection([
    [
        '725009170839109682',
        {
            id: '725009170839109682',
            name: 'Rin\'s Solo Camp',
            welcomeChannelID: '725009172357316698',
            logChannelID: '725030145840382053',
            welcome: new MessageEmbed()
                .setColor('#059ecd')
                .setDescription('Rin is love, Rin is life.\n\n' +
                    'Check out the rules in <#779044446104059914> to gain access to the server.')
                .setImage('https://raw.githubusercontent.com/Kazumik0108/CinnaBot/main/images/welcome/RinWave1.gif'),
        },
    ],
]);