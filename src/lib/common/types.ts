import { Channel, Embed, Guild, Reaction, ReactionRole } from '../../entity';

export type EntityInput = 'channel' | 'embed' | 'guild' | 'reaction' | 'role';
export type EntityOutput = Channel | Embed | Guild | Reaction | ReactionRole;
