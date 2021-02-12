interface TwitterUser {
  id: string;
  handle?: string;
  channels: string[];
}

export const twitterUsers: TwitterUser[] = [
  {
    id: '1354893702397890563',
    handle: '@KenoHyo',
    channels: ['798740558943617025', '725369288432812052'],
  },
  {
    id: '961673790668197888',
    handle: '@shimarin_bot',
    channels: ['725009340758622300'],
  },
  {
    id: '1009428283866271744',
    handle: '@s_rin_pic',
    channels: ['725009340758622300'],
  },
];
