import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';

interface ReactionEmote {
  id: string;
  name?: string;
  roleID: string;
  roleName?: string;
}

export interface EmbedMessage {
  name: string;
  channelID: string;
  embed: MessageEmbed;
  reactions: ReactionEmote[];
}

export const welcomeMessageTitle = "Welcome to Rin's Solo Camp!";
export const rulesMessageTitle = 'Server Rules';
export const accessRolesMessageTitle = 'Access Roles';
export const colorRolesMessageTitle = 'Color Roles';

// To properly cache the messages (in ready.ts), the message ids here should be manually-updated with the target id of the output message from the command embed.ts
export const welcomeMessage: EmbedMessage = {
  name: 'welcome',
  channelID: '779044446104059914',
  embed: new MessageEmbed()
    .setTitle(welcomeMessageTitle)
    .setColor('#0558cd')
    .setDescription('Thanks for joining us. Stay comfy and send your prayers to Shima Rin in <#725406708989427782>.')
    .setThumbnail('https://cdn.discordapp.com/emojis/725155394934145105.png?v=1'),
  reactions: [],
};

export const rulesMessage: EmbedMessage = {
  name: 'rules',
  channelID: '779044446104059914',
  embed: new MessageEmbed()
    .setTitle(rulesMessageTitle)
    .setColor('#059ecd')
    .setDescription(
      'Please familiarize yourself with our rules below. To gain access to the rest of the server, react to the message with <:RinIcon:725037351486881824> to become a <@&747124541259776030>.',
    )
    .addFields([
      {
        name: '1. General Decency',
        value:
          'Please be respectful of others. Harrassment and insults will not be tolerated and will be met with warnings, mutes, or bans as necessary. Please ping our <@&725016505749864570> if there are any issues in the chat.',
      },
      {
        name: '2. On NSFW/18+ content',
        value: stripIndents`
          Yuru Camp is not a NSFW series and not all of our members are over 18. Keep the channels SFW and refrain from sending such images, text, and links.
          
          At minimum, spoiler tag any messages with questionable content.,
          `,
      },
      {
        name: '3. Spamming',
        value:
          'Please do not use the server to spam whatever you want. Some channels under the `Spamming` category exist for this purpose.',
      },
      {
        name: '4. Spoilers',
        value: stripIndents`
          Keep spoilers for anime, manga, novels, etc. out of <#725009172357316698> and the voice channels. Not everybody reads or watches at the same pace. Ideally, spoiler-tag the content and mention the series so others are aware of what is being spoilered. This goes especially for seasonals.

          Yuru Camp spoilers specifically belong in <#796779279466758185>.`,
      },
    ]),
  reactions: [
    {
      id: '725037351486881824',
      name: 'RinIcon',
      roleID: '747124541259776030',
      roleName: 'Rin Simp',
    },
  ],
};

export const accessRolesMessage: EmbedMessage = {
  name: 'access roles',
  channelID: '804157684591886356',
  embed: new MessageEmbed()
    .setTitle(accessRolesMessageTitle)
    .setColor('#fc9003')
    .setDescription('Get access to opt-in channels or Rythm commands.')
    .addFields([
      {
        name: 'Key',
        value: stripIndents`
          <:RinPinged:745677254696370266> : <@&796073053662216242> Access to <@!159985870458322944>'s dumping grounds.
          <:RinRelax:725059880771125339> : <@&779068605433118780> Access to all of <@!235088799074484224>'s music commands.`,
      },
    ]),
  reactions: [
    {
      id: '745677254696370266',
      name: 'RinPinged',
      roleID: '796073053662216242',
      roleName: 'Rin Twitter',
    },
    {
      id: '725059880771125339',
      name: 'RinRelax',
      roleID: '779068605433118780',
      roleName: 'DJ',
    },
  ],
};

export const colorRolesMessage: EmbedMessage = {
  name: 'color roles',
  channelID: '804157684591886356',
  embed: new MessageEmbed()
    .setTitle(colorRolesMessageTitle)
    .setColor('#991a09')
    .setDescription('Want to change your color? Currently, you can add and remove your colored roles infinite times.')
    .addFields([
      {
        name: 'The highest role in the list will become the color for your username',
        value: stripIndents`
          - If you do not have the role, reacting with the emote will give you the role.
          - If you already have the role, reacting with the emote wil remove the role.`,
      },
      {
        name: 'Key',
        value: stripIndents`
          <:Blue:803862924950110210> : <@&779064341407858698>
          <:Cyan:803862924966756374> : <@&779064270893613086>
          <:LightGreen:803862925411745802> : <@&779063968194494474>
          <:DarkGreen:803862924992053249> : <@&779064181403811861>
          <:Yellow:803862925122338858> : <@&779064071780696074>
          <:Tan:803862925277265950> : <@&779065017609879593>
          <:Orange:803862925269794857> : <@&779064295312719892>
          <:Red:803862925219332106> : <@&779064099760898078>
          <:Pink:803862924875661333> : <@&779064227620192277>
          <:Lavender:803862925176602665> : <@&779065535987056680>
          <:Purple:803862925000441897> : <@&779064248188928001>
          <:Violet:803862925273464862> : <@&779064145378017310>`,
      },
    ]),
  reactions: [
    {
      id: '803862924950110210',
      roleID: '779064341407858698',
      roleName: 'Blue',
    },
    {
      id: '803862924966756374',
      roleID: '779064270893613086',
      roleName: 'Cyan',
    },
    {
      id: '803862925411745802',
      roleID: '779063968194494474',
      roleName: 'Light Green',
    },
    {
      id: '803862924992053249',
      roleID: '779064181403811861',
      roleName: 'Dark Green',
    },
    {
      id: '803862925122338858',
      roleID: '779064071780696074',
      roleName: 'Yellow',
    },
    {
      id: '803862925277265950',
      roleID: '779065017609879593',
      roleName: 'Tan',
    },
    {
      id: '803862925269794857',
      roleID: '779064295312719892',
      roleName: 'Orange',
    },
    {
      id: '803862925219332106',
      roleID: '779064099760898078',
      roleName: 'Red',
    },
    {
      id: '803862924875661333',
      roleID: '779064227620192277',
      roleName: 'Pink',
    },
    {
      id: '803862925176602665',
      roleID: '779065535987056680',
      roleName: 'Lavender',
    },
    {
      id: '803862925000441897',
      roleID: '779064248188928001',
      roleName: 'Purple',
    },
    {
      id: '803862925273464862',
      roleID: '779064145378017310',
      roleName: 'Violet',
    },
  ],
};

export const allReceptionMessages: EmbedMessage[] = [
  welcomeMessage,
  rulesMessage,
  accessRolesMessage,
  colorRolesMessage,
];
