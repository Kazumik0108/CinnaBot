/*
ID  NAME        FORMAT	                EXAMPLE
0   Game	    Playing {name}	        "Playing Rocket League"
1   Streaming	Streaming {details}	    "Streaming Rocket League"
2   Listening	Listening to {name}	    "Listening to Spotify"
3   Watching    Watching {name}         "Watching a movie"
4   Custom	    {emoji} {name}	        ":smiley: I am cool"
5   Competing	Competing in {name}	    "Competing in Arena World Champions"
*/

interface status {
    id: number,
    name: string;
    content: string;
}

export const statuses: Array<status> = [
    {
        id: 2,
        name: 'LISTENING',
        content: 'the fireflies',
    },
    {
        id: 2,
        name: 'LISTENING',
        content: 'silence',
    },
    {
        id: 2,
        name: 'LISTENING',
        content: 'Sensei',
    },
    {
        id: 2,
        name: 'LISTENING',
        content: 'the waves by the shore',
    },
    {
        id: 3,
        name: 'WATCHING',
        content: 'over the moon',
    },
    {
        id: 3,
        name: 'WATCHING',
        content: 'the ocean',
    },
    {
        id: 3,
        name: 'WATCHING',
        content: 'over the winter',
    },
    {
        id: 3,
        name: 'WATCHING',
        content: 'a useless gem',
    },
    {
        id: 3,
        name: 'WATCHING',
        content: 'the jellyfish',
    },
    {
        id: 3,
        name: 'WATCHING',
        content: 'the Lunarians',
    },
    {
        id: 3,
        name: 'WATCHING',
        content: 'Sensei pray',
    },
];