// ID  NAME         FORMAT	                EXAMPLE
// 0   Game	        Playing {name}	        "Playing Rocket League"
// 1   Streaming	  Streaming {details}	    "Streaming Rocket League"
// 2   Listening	  Listening to {name}	    "Listening to Spotify"
// 3   Watching     Watching {name}         "Watching a movie"
// 4   Custom	      {emoji} {name}	        ":smiley: I am cool"
// 5   Competing	  Competing in {name}	    "Competing in Arena World Champions"

export type Status = {
  id: number;
  name: string;
  activity: string;
};

interface StatusGroup {
  id: number;
  name: string;
  activities: string[];
}

const listening: StatusGroup = {
  id: 2,
  name: 'LISTENING',
  activities: ['the fireflies', 'silence', 'Sensei', 'the waves by the shore'],
};

const watching: StatusGroup = {
  id: 3,
  name: 'WATCHING',
  activities: [
    'over the moon',
    'the ocean',
    'over the winter',
    'a useless gem',
    'the jellyfish',
    'the Lunarians',
    'Sensei pray',
  ],
};

export const botStatuses = [listening, watching];
