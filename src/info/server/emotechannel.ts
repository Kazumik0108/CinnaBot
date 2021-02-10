// emotechannel.ts

interface server {
  id: string;
  name?: string;
}

export interface emoteChannel {
  id: string;
  name?: string;
  guildID: string;
  guildname?: string;
  servers: server[];
}

export const emoteChannels: emoteChannel[] = [
  {
    id: '725027776691830844',
    name: 'emote-list',
    guildID: '725009170839109682',
    guildname: "Rin's Solo Camp",
    servers: [
      {
        id: '725009170839109682',
        name: "Rin's Solo Camp",
      },
      {
        id: '791283144733098004',
        name: "Drake's Emote Server",
      },
    ],
  },
  {
    id: '798741263490875403',
    name: 'development-debug',
    guildID: '798740415192105010',
    guildname: 'CinnaBot Development',
    servers: [
      {
        id: '798740415192105010',
        name: 'CinnaBot Development',
      },
      {
        id: '725009170839109682',
        name: "Rin's Solo Camp",
      },
    ],
  },
];
