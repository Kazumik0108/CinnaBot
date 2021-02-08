// twitter.ts
import { reactChannel } from '../../interfaces/reactInterface';


interface twitterUser {
    id: string;
    handle?: string;
    channels: reactChannel[];
}

export const twitterUsers: twitterUser[] = [
    {
        id: '1354893702397890563',
        handle: '@KenoHyo',
        channels: [
            {
                id: '798740558943617025',
            },
            {
                id: '725369288432812052',
            },
        ],
    },
    {
        id: '961673790668197888',
        handle: '@shimarin_bot',
        channels: [
            {
                id: '725009340758622300',
            },
        ],
    },
    {
        id: '1009428283866271744',
        handle: '@s_rin_pic',
        channels: [
            {
                id: '725009340758622300',
            },
        ],
    },
];