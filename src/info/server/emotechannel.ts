import { guildRinSolo, guildDrake, guildCinnaBot } from './guilds';

export interface EmoteChannel {
  id: string;
  name?: string;
  guildID: string;
  guildName?: string;
  servers: {
    id: string;
    name?: string;
  }[];
}

export const emoteChannels: EmoteChannel[] = [
  {
    id: '725027776691830844',
    name: 'emote-list',
    guildID: guildRinSolo.id,
    guildName: guildRinSolo.name,
    servers: [
      {
        id: guildRinSolo.id,
        name: guildRinSolo.name,
      },
      {
        id: guildDrake.id,
        name: guildDrake.name,
      },
    ],
  },
  {
    id: '798741263490875403',
    name: 'development-debug',
    guildID: guildCinnaBot.id,
    guildName: guildCinnaBot.name,
    servers: [
      {
        id: guildCinnaBot.id,
        name: guildCinnaBot.name,
      },
      {
        id: guildRinSolo.id,
        name: guildRinSolo.name,
      },
    ],
  },
];
