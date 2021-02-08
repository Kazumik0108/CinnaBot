// guildMemberAdd.ts
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { welcomeGuilds } from '../info/server/welcome';

export default async (client: CommandoClient, member: GuildMember): Promise<void> => {
    if (welcomeGuilds.has(member.guild.id)) {
        // log the join event to the log channel, if specified
        Promise.resolve(welcomeGuilds.get(member.guild.id))
            .then(guild => {
                if (guild?.logChannelID) {
                    Promise.resolve(client.channels.cache.get(guild.logChannelID) as TextChannel)
                        .then(logChannel => logChannel.send(`${member.user.username} has joined ${member.guild.name}!`));
                }

                // Do not send embed messages for bots
                if (member.user.bot) return;

                const embedMessage = (guild?.welcome as MessageEmbed)
                    .setTitle(member.guild.name)
                    .setThumbnail(member.user.avatarURL()!);

                Promise.resolve(client.channels.cache.get(guild!.welcomeChannelID) as TextChannel)
                    .then(welcomeChannel => welcomeChannel.send(`Welcome <@${member.user.id}>!`, embedMessage));

            });
    }
};