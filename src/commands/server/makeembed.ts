import { GuildChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

import isUrl from 'is-url';
import { EmbedMessageFieldsPrompt } from '../../handlers/server/handleEmbedMessageArgs';
import { CHANNEL_ID } from '../../lib/common/regex';
import { hexColorParser } from '../../lib/utils/color/parseHexColor';
import { getGuildChannel } from '../../lib/utils/guild/getGuildChannel';

// interface PromptArgs {
//   channel: GuildChannel;
//   args: MessageEmbedOptions;
// }

export default class makeEmbed extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'makeembed',
      group: 'server',
      memberName: 'makeembed',
      description: 'Creates and sends an embed message to a channel within the server.',
      guildOnly: true,
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES'],
      args: [
        {
          key: 'channel',
          prompt: 'Mention the target channel for the embed message.',
          type: 'string',
          validate: (mention: string, m: CommandoMessage) => {
            const match = mention.match(CHANNEL_ID);
            if (match == null) return false;
            const id = match[0];
            const channel = getGuildChannel(id, m);
            return channel != null ? true : false;
          },
          parse: (mention: string, m: CommandoMessage) => {
            const match = <RegExpMatchArray>mention.match(CHANNEL_ID);
            const id = match[0];
            const channel = <GuildChannel>getGuildChannel(id, m);
            return channel;
          },
        },
        {
          key: 'title',
          prompt: 'Specify the title for the embed message.',
          type: 'string',
        },
        {
          key: 'url',
          prompt: 'Specify a URL to link the title to, or `next` to use none.',
          type: 'string',
          validate: (string: string) => {
            if (string == 'next') return true;
            return isUrl(string);
          },
        },
        {
          key: 'description',
          prompt: 'Specify a description for the embed message, or `next` to leave it empty.',
          type: 'string',
        },
        {
          key: 'color',
          prompt: 'Specify a hex color for the embed message, or `next` to default to #000 (black).',
          type: 'string',
          validate: (string: string) => {
            if (string == 'next') return true;
            return hexColorParser(string) != null ? true : false;
          },
          parse: (string: string) => {
            if (string == 'next') return '#000';
            return <string>hexColorParser(string);
          },
        },
        {
          key: 'thumbnail',
          prompt: 'Specify a URL for the thumbnail, or `next` to use none.',
          type: 'string',
          validate: (string: string) => {
            if (string == 'next') return true;
            return true;
            // return isImageUrl();
          },
        },
        {
          key: 'image',
          prompt: 'Specify a URL for the bottom image, or `next` to use none.',
          type: 'string',
          validate: (string: string) => {
            if (string == 'next') return true;
            return true;
            // return isImageUrl();
          },
        },
        {
          key: 'footer',
          prompt: 'Specify a footer for the embed message, or `next` to use none.',
          type: 'string',
        },
        {
          key: 'fields',
          prompt: EmbedMessageFieldsPrompt(),
          type: 'string',
        },
      ],
    });
  }

  async run(message: CommandoMessage) {
    console.log(message);
    return null;
  }
}
