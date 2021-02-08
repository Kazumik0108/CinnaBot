// reactInterface.ts
import { MessageEmbed } from 'discord.js';


export interface reactEntity {
    id: string;
    name?: string;
}

export interface reactEmote extends reactEntity {
    roleID?: string;
    roleName?: string;
    message?: reactMessage;
}

export interface reactMessage extends reactEntity {
    embed: MessageEmbed;
    reactions?: reactEmote[];
    channel?: reactChannel;
}

export interface reactChannel extends reactEntity {
    messages?: reactMessage[];
    guild?: reactGuild;
}

export interface reactGuild extends reactEntity {
    channels: reactChannel[];
}

export interface reactGroup {
    name: string;
    emotes: string[];
}