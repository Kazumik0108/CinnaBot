import { Channel, Guild, Reaction, ReactionRole } from '../../entity';

export type EntityInput = 'channel' | 'guild' | 'reaction' | 'role';
export type EntityOutput = Channel | Guild | Reaction | ReactionRole;
