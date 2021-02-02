// message.js

///// imports
const configFile = "config.json";
const { reactions } = require(`../${configFile}`);


///// exports
module.exports = async (client, message) => {
    // Emote replace block
    // Attempt to replace emotes in a message by a user by checking the contents of a substring enclosed by a pair of colons, e.g. :emote:
    // Ignore messages with any code blocks or escape characters
    let emoteCheck = message.content.split(/\:/).length > 2 && message.content.split(/\`/).length <= 1 && message.content.split(/\\/).length <= 1; 
    const emoteRegex = /<a?:\w+:\d+>|(?<!\\):(\w+):/g;
    if (emoteCheck) {
        let newMessage = message.content.replace(emoteRegex, replaceMessageEmotes);
        // only send webhook if the message content is different
        if (message.content !== newMessage) sendMessageWebhook(newMessage);
    }

    // Bot reaction block
    // React only to messages containing valid emotes and no extra text
    if (message.content.split(/<a?:\w+:\d+>/g).every(text => !text.match(/\w/))) {
        Object.values(reactions).forEach(reactionGroup => {
            const match = reactionGroup.some(reaction => message.content.includes(reaction));
            if (match) reactionGroup.forEach(reaction => message.react(reaction));
        });
    }
    
    // prevent following commands if author is bot or the message is in a DM
    if (message.author.bot || message.channel.type === 'dm') return;


    ///// functions
    function replaceMessageEmotes(substring, match) {
        // Returns a string after attempting to replace the emote substrings of the original message
        if (match) {
            let emoteMatch = getMatchEmojis(substring, match);
            if (emoteMatch) {
                return (emoteMatch.animated) ? `<a:${emoteMatch.name}:${emoteMatch.id}>` : `<:${emoteMatch.name}:${emoteMatch.id}>`;
            }
        }
        // if no emote matches were found, return the original substring
        return substring;
    }
    
    function getMatchEmojis(substring, match) {
        // prioritize the first emote found in the messaged server, otherwise get the first match in other servers
        let emoteMatch = message.guild.emojis.cache.find(emote => emote.name.toLowerCase() === match.toLowerCase());
        if (!emoteMatch) {
            emoteMatch = client.guilds.cache.flatMap(guild => guild.emojis.cache).find(emote => emote.name.toLowerCase() === match.toLowerCase());
        }
        return emoteMatch;
    }

    async function sendMessageWebhook(content) {
        // Deletes the OP's message and sends a webhook mimicking the OP
        // Function requires the bot to have MANAGE_MESSAGES and MANAGE_WEBHOOKS permissions
        const bot = message.guild.member(client.user);
        const botPerms = bot.permissions.toArray();
        let botFlags = ['MANAGE_MESSAGES', 'MANAGE_WEBHOOKS'];
        botFlags = botFlags.filter(flag => !botPerms.some(perm => perm === flag));
        if (botFlags.length > 0) return message.reply(`I am missing \`${botFlags}\` permissions in this server for this command.`);

        // Function also requires @everyone to have USE_EXTERNAL_EMOJIS permissions
        const everyone = message.guild.roles.cache.find(role => role.name === '@everyone');
        const everyonePerms = everyone.permissions.toArray();
        let everyoneFlags = ['USE_EXTERNAL_EMOJIS'];
        everyoneFlags = everyoneFlags.filter(flag => !everyonePerms.some(perm => perm === flag));
        if (everyoneFlags.length > 0) return message.reply(`the role \`\@everyone\` is missing \`${everyoneFlags}\` permissions in this server for this command.`);

        // bot & @everyone has required permissions if the code reaches this block
        message.delete().catch( error => {
            console.error("Failed to delete the message:", error);
        });
        const webhooks = await message.channel.fetchWebhooks();
        const webhook = webhooks.first();
    
        // get user info from the message
        const member = message.guild.member(message.author);
        const nickname = member ? member.displayName : null;
        const avatar = message.author.displayAvatarURL();
    
        if (typeof(webhook) === 'undefined') {                
            // no webhook exists in this channel, so create one
            message.channel.createWebhook('CinnaBot')
                .then(webhook => {
                    webhook.send(content, {
                        username: nickname,
                        avatarURL: avatar,
                    });
                });
        } else {
            // send the content through the existing channel webhook
            webhook.send(content, {
                username: nickname,
                avatarURL: avatar,
            });
        }
    }
};
