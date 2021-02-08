// emotelist.ts
import { MessageEmbed, Guild, GuildEmoji, Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';


const emoteMessageArray = (emotes: string[]): string[] => {
    // Recursively call an array of emotes to return them in a multi-line message of 25 emotes, up to 5 emotes per line
    // Base case: 5 or less emotes are given, return the emotes in a single string
    if (emotes.length <= 5) {
        return [emotes.join('')];
    }
    // Second case: 25 or less emotes are given, return the emotes in groups of five, joined by a new line
    else if (emotes.length <= 25) {
        return [[emoteMessageArray(emotes.slice(0, 5)), emoteMessageArray(emotes.slice(5))].join('\n')];
    }
    // Otherwise, concatenate the first 25 emotes with the remainder
    else {
        return ([] as string[]).concat(emoteMessageArray(emotes.slice(0, 25)), emoteMessageArray(emotes.slice(25)));
    }
};

const today = (): string => {
    // Get the date and time when the command is executed
    const date = new Date();
    return date.toUTCString();
};


export default class serverEmoteList extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'emotelist',
            group: 'emote',
            memberName: 'emotelist',
            description: 'Sends the list of emotes from a server. The author can only show emotes from servers they share with the bot. Send \'0\' to show the list of emotes in the current server.',
            examples: ['+emotelist', '+emotelist 0'],
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES'],
            userPermissions: ['MANAGE_EMOJIS', 'MANAGE_MESSAGES'],
        });
    }

    async run(message: CommandoMessage): Promise<null> {
        // return early if author is bot
        if (message.author.bot) return null;

        // if the user entered '0', send the emotes for the messaged server
        // else ask the users to select from a server they share with the bot
        const args = message.content.split(/ +/);
        if (args[args.length - 1] === '0') {
            const guild = message.guild as Guild;
            sendGuildEmotes(guild);
        }
        else {
            // get the array of servers that the author shares with the client
            // then sort servers by name, while listing the messaged server on top
            const userGuilds = message.client.guilds.cache.filter((guild: any) => {
                return guild.members.fetch(message.author.id)
                    .then(() => guild)
                    .catch(() => null);
            }).map(guild => guild)
                .sort((a, b) => {
                    return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1;
                }).sort(a => {
                    return (a.name.toLowerCase() === (message.guild as Guild).name.toLowerCase()) ? -1 : 1;
                });

            // ask the user to choose the server to display emotes for
            const guildNames = userGuilds.map((guild, index) => `${index}: ${guild.name}`);
            message.reply(`choose the server number below to display the emotes from. Send \`cancel\` to abort this command.\n\`\`\`\n${guildNames.join('\n')}\n\`\`\``).then(msg => msg.delete({ timeout: 20 * 1000 }));

            const filter = (msg: Message) => (msg.author.id === message.author.id) && (msg.content.toLowerCase() === 'end' || (parseInt(msg.content, 10) >= 0 && parseInt(msg.content, 10) < guildNames.length));
            const collector = message.channel.createMessageCollector(filter, { time: 30 * 1000 });

            collector.on('collect', collect => {
                // ends the collector when a value index is given or when 'end' is given
                if (collect.content.toLowerCase() === 'end') collector.stop();
                if (userGuilds[collect.content]) {
                    sendGuildEmotes(userGuilds[collect.content]);
                    collector.stop();
                }
            });

            collector.on('end', collected => {
                // delete all collected messages
                collected.forEach(msg => msg.delete({ timeout: 2000 }));
            });
        }


        function sendGuildEmotes(guild: Guild) {
            // send the list of emotes from the specified guild object
            const emotes = guild.emojis.cache;
            const emoteFormat = (emote: GuildEmoji): string => {
                return (emote.animated) ? `<a:${emote.name}:${emote.id}>` : `<:${emote.name}:${emote.id}>`;
            };
            const emoteSort = (a: GuildEmoji, b: GuildEmoji): number => {
                return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1;
            };

            const emoteStatic = emotes.filter(emote => !emote.animated).sort((a, b) => emoteSort(a, b));
            const emoteAnimated = emotes.filter(emote => emote.animated).sort((a, b) => emoteSort(a, b));

            const textStatic = emoteMessageArray(emoteStatic.map(emote => emoteFormat(emote)));
            const textAnimated = emoteMessageArray(emoteAnimated.map(emote => emoteFormat(emote)));

            // send the emotes into the messaged channel
            const embedMessage = new MessageEmbed()
                .setTitle(`${guild.name} Emote List`)
                .setThumbnail(guild.iconURL() as string)
                .setFooter(`Updated ${today()}`)
                .addField('Static Emotes', `(${emoteStatic.size}/100)`, true)
                .addField('Animated Emotes', `(${emoteAnimated.size}/100)`, true);

            // message.say(text)))
            message.say(embedMessage)
                .then(() => message.say('**Static Emotes**'))
                .then(() => {
                    textStatic.forEach(text => {
                        if (text !== '') message.say(text);
                    });
                })
                .then(() => message.say('**Animated Emotes**'))
                .then(() => {
                    textAnimated.forEach(text => {
                        if (text !== '') message.say(text);
                    });
                });
        }


        return null;
    }
}