// message.ts
import { Guild, GuildEmoji, GuildMember, Role, TextChannel } from 'discord.js';
import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { reactions } from '../info/server/reactionbot';


export default async (client: CommandoClient, message: CommandoMessage): Promise<void> => {
    // Prevent the following commands if the message author is a bot or the message is in a DM
    if (message.author.bot || message.channel.type === 'dm') return;

    // Define message checkers
    const checkEmote = (msg: CommandoMessage): boolean => {
        // Return true if there is at least one pair of colons, denoting a possible emote, and no backticks or escape characters in the message contents
        return msg.content.split(/:/).length > 2 && msg.content.split(/`/).length <= 1 && msg.content.split(/\\/).length <= 1;
    };
    const checkReact = (msg: CommandoMessage): boolean => {
        // Return true if the message contains actual emotes with no text. White spaces and new lines are allowed in the message contents
        const reactRegex = /<a?:\w+:\d+>/g;
        return msg.content.split(reactRegex).every(text => !text.match(/\w/));
    };

    // Emote replace block
    // Attempt to replace emotes in a message by a user by checking the contents of a substring enclosed by a pair of colons, e.g. :emote:
    if (checkEmote(message)) {
        const regexEmote = /<a?:\w+:\d+>|(?<!\\):(\w+):/g;
        const newMessage = message.content.replace(regexEmote, replaceMessageEmotes);
        // only send webhook if the new message content is different
        if (message.content !== newMessage) sendMessageWebhook(newMessage);
    }

    // Bot reaction block
    // React only to messages containing valid emotes and no extra text
    if (checkReact(message)) {
        reactions.forEach(reactionGroup => {
            const checkMatch = reactionGroup.emotes.some(reaction => message.content.includes(reaction));
            if (checkMatch) reactionGroup.emotes.forEach(reaction => message.react(reaction));
        });
    }


    function replaceMessageEmotes(substring: string, match: string): string {
        // Returns a string after attempting to replace the emote substrings of the original message
        if (match) {
            const emoteMatch = getMatchEmojis(match);
            if (emoteMatch) {
                return (emoteMatch.animated) ? `<a:${emoteMatch.name}:${emoteMatch.id}>` : `<:${emoteMatch.name}:${emoteMatch.id}>`;
            }
        }
        // if no emote matches were found, return the original substring
        return substring;
    }

    function getMatchEmojis(match: string): GuildEmoji | undefined {
        // If the matched emote exists in the server, use that emote
        // Otherwise, try to find it in another server
        let emoteMatch = (message.guild as Guild).emojis.cache.find(emote => emote.name.toLowerCase() === match.toLowerCase());
        if (!emoteMatch) {
            emoteMatch = client.guilds.cache.flatMap(guild => guild.emojis.cache).find(emote => emote.name.toLowerCase() === match.toLowerCase());
        }
        return emoteMatch;
    }

    function sendMessageWebhook(content: string): void {
        // Deletes the OP's message and sends a webhook mimicking the OP
        // Function requires the bot to have MANAGE_MESSAGES and MANAGE_WEBHOOKS permissions
        // Function also requires @everyone to have USE_EXTERNAL_EMOJIS permissions
        const bot = message.guild?.member(client.user!) as GuildMember;
        if (!bot.permissions.has(['MANAGE_MESSAGES', 'MANAGE_WEBHOOKS'])) {
            message.reply('I require `MANAGE_MESSAGES, MANAGE_WEBHOOKS` permissions in this server to replace emotes in a message.')
                .then(botReply => botReply.delete({ timeout: 10 * 1000 }));
            return;
        }

        const everyone = message.guild?.roles.cache.find(role => role.name === '@everyone') as Role;
        if (!everyone.permissions.has('USE_EXTERNAL_EMOJIS')) {
            message.reply('The role `@everyone` requires `USE_EXTERNAL_EMOJIS` permissions in this server to replace emotes in a message.')
                .then(everyoneReply => everyoneReply.delete({ timeout: 10 * 1000 }));
            return;
        }


        // bot & @everyone has required permissions if the code reaches this block
        message.delete().catch(error => {
            console.error('Failed to delete the message:', error);
        });

        Promise.resolve((message.channel as TextChannel).fetchWebhooks())
            .then(webhooks => webhooks.first())
            .then(webhook => {
                // get user info from the message
                const member = (message.guild as Guild).member(message.author) as GuildMember;
                const nickname = member ? member.displayName : message.author.username;
                const avatar = message.author.displayAvatarURL();

                if (webhook) {
                    // send the content through the existing channel webhook
                    webhook.send(content, {
                        username: nickname,
                        avatarURL: avatar,
                    });
                }
                else {
                    // no webhook exists in this channel, so create one
                    (message.channel as TextChannel).createWebhook('CinnaBot')
                        .then(newWebhook => {
                            newWebhook.send(content, {
                                username: nickname,
                                avatarURL: avatar,
                            });
                        });
                }
            });
    }
};
