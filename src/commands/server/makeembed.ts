import {
  MessageEmbedFooter,
  MessageEmbedImage,
  MessageEmbedOptions,
  MessageEmbedThumbnail,
  TextChannel
} from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import isImageUrl from 'is-image-url';
import isUrl from 'is-url';
import { handleEmbedMessageData } from '../../handlers/embed/handleEmbedMessageData';
import { CHANNEL_ID } from '../../lib/common/regex';
import { hexColorParser } from '../../lib/utils/color/parseHexColor';
import { getGuildChannel } from '../../lib/utils/guild/getGuildChannel';

interface PromptArgs {
  channel: TextChannel;
  title: string;
  url: string | undefined;
  description: string;
  color: string;
  thumbnail: MessageEmbedThumbnail | undefined;
  image: MessageEmbedImage | undefined;
  footer: MessageEmbedFooter;
}

export default class makeEmbed extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'makeembed',
      aliases: ['membed'],
      group: 'server',
      memberName: 'makeembed',
      description: 'Creates and sends an embed message to a channel within the server.',
      guildOnly: true,
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES'],
      argsSingleQuotes: true,
      args: [
        {
          key: 'channel',
          prompt: 'Mention the target channel for the embed message.',
          type: 'string',
          validate: (mention: string, m: CommandoMessage) => {
            const match = mention.match(CHANNEL_ID);
            if (match == null) return false;
            const id = match[0];
            const channel = getGuildChannel(id, m.client);
            return channel != null ? true : false;
          },
          parse: (mention: string, m: CommandoMessage) => {
            const match = <RegExpMatchArray>mention.match(CHANNEL_ID);
            const id = match[0];
            const channel = <TextChannel>getGuildChannel(id, m.client);
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
          validate: (url: string) => {
            if (url == 'next') return true;
            return isUrl(url);
          },
          parse: (url: string) => {
            return url == 'next' ? undefined : url;
          },
        },
        {
          key: 'description',
          prompt: 'Specify a description for the embed message, or `next` to leave it empty.',
          type: 'string',
          parse: (description: string) => {
            return description == 'next' ? undefined : description;
          },
        },
        {
          key: 'color',
          prompt: 'Specify a hex color for the embed message, or `next` to default to #000 (black).',
          type: 'string',
          validate: (color: string) => {
            if (color == 'next') return true;
            return hexColorParser(color) != null ? true : false;
          },
          parse: (string: string) => {
            if (string == 'next') return undefined;
            return <string>hexColorParser(string);
          },
        },
        {
          key: 'thumbnail',
          prompt: 'Specify a URL for the thumbnail, or `next` to use none.',
          type: 'string',
          validate: (url: string) => {
            if (url == 'next') return true;
            return isImageUrl(url);
          },
          parse: (url: string) => {
            if (url == 'next') return undefined;
            const image: MessageEmbedThumbnail = {
              url: url,
            };
            return image;
          },
        },
        {
          key: 'image',
          prompt: 'Specify a URL for the bottom image, or `next` to use none.',
          type: 'string',
          validate: (url: string) => {
            if (url == 'next') return true;
            return isImageUrl(url);
          },
          parse: (url: string) => {
            if (url == 'next') return undefined;
            const image: MessageEmbedImage = {
              url: url,
            };
            return image;
          },
        },
        {
          key: 'footer',
          prompt: 'Specify a footer for the embed message, or `next` to use none.',
          type: 'string',
          parse: (text: string) => {
            if (text == 'next') return undefined;
            const footer: MessageEmbedFooter = {
              text: text,
            };
            return footer;
          },
        },
        // {
        //   key: 'fields',
        //   prompt: EmbedMessageFieldsPrompt(),
        //   type: 'string',
        //   validate: (string: string) => {
        //     const match = string.match(/^(?:field)/);
        //     return match != null ? true : false;
        //   },
        // },
      ],
    });
  }

  async run(
    message: CommandoMessage,
    { channel, title, url, description, color, thumbnail, image, footer }: PromptArgs,
  ) {
    const embedData: MessageEmbedOptions = {
      title: title,
      url: url,
      description: description,
      color: color,
      thumbnail: thumbnail,
      image: image,
      footer: footer,
      timestamp: new Date(),
    };

    const embed = handleEmbedMessageData(embedData, message);
    channel.send(embed);

    return null;
  }
}
