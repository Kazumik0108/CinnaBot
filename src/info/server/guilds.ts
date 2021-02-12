import { MessageEmbed } from 'discord.js';
import { accessRolesMessage, colorRolesMessage, EmbedMessage, rulesMessage, welcomeMessage } from './reception';

interface Channel {
  id: string;
  name: string;
  messages: EmbedMessage[];
}

interface Guild {
  id: string;
  name: string;
  channels: Channel[];
  logChannelID?: string;
  welcomeChannelID?: string;
  welcomeEmbed?: MessageEmbed;
}

export const guildRinSolo: Guild = {
  id: '725009170839109682',
  name: "Rin's Solo Camp",
  channels: [
    {
      id: '779044446104059914',
      name: 'rules-and-info',
      messages: [welcomeMessage, rulesMessage],
    },
    {
      id: '804157684591886356',
      name: 'role-picker',
      messages: [accessRolesMessage, colorRolesMessage],
    },
  ],
  logChannelID: '725030145840382053',
  welcomeChannelID: '725009172357316698',
  welcomeEmbed: new MessageEmbed()
    .setColor('#059ecd')
    .setDescription(
      'Rin is love, Rin is life.\n\n' + 'Check out the rules in <#779044446104059914> to gain access to the server.',
    )
    .setImage('https://raw.githubusercontent.com/Kazumik0108/CinnaBot/main/images/welcome/RinWave1.gif'),
};

export const guildDrake: Guild = {
  id: '791283144733098004',
  name: "Drake's Emote Server",
  channels: [],
};

export const guildCinnaBot: Guild = {
  id: '798740415192105010',
  name: 'CinnaBot Development',
  channels: [],
};
