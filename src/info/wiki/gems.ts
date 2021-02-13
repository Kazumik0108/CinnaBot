import { MessageEmbed } from 'discord.js';

interface Gem {
  aliases: string[];
  embed: MessageEmbed;
}

const phos: Gem = {
  aliases: ['phos', 'phosphos', 'phosphosphyllite'],
  embed: new MessageEmbed()
    .setTitle('Phos / フォス')
    .setColor('#28a59b')
    .setDescription(
      'Hardness three and a half. The youngest of the jewels, 300 years old. He was extremely fragile and weak in toughness, so he was not suitable for battle, and he was clumsy and useless no matter what he did, but he was given the job of compiling a museum magazine for the first time in his life.',
    )
    .setThumbnail('http://land-of-the-lustrous.com/core_sys/images/main/top/top_img.png')
    .setImage('http://land-of-the-lustrous.com/core_sys/images/contents/00000004/base/001.png?1534933411')
    .setFooter('http://land-of-the-lustrous.com/chara/phosphophyllite.html')
    .addFields([
      {
        name: 'Hardness',
        value: '3.5',
        inline: true,
      },
      {
        name: 'Mineral',
        value: 'Phosphate',
        inline: true,
      },
      {
        name: 'Chemistry',
        value: 'Zn2Fe(PO4)2•4H2O',
        inline: true,
      },
      {
        name: 'Color',
        value: 'Blue-green to colorless',
        inline: false,
      },
      {
        name: 'Job',
        value: 'Historian',
        inline: false,
      },
    ]),
};

const cinnabar: Gem = {
  aliases: ['cinnabar', 'shinsha'],
  embed: new MessageEmbed()
    .setTitle('Cinnabar / シンシャ')
    .setColor('#bd081d')
    .setDescription(
      'Hardness two. Due to the idiosyncratic nature of the inexhaustible release of venom from the body, he is in charge of patrolling the night when the moon does not appear, keeping a distance from other jewels. Intelligent and thoughtful.',
    )
    .setThumbnail('http://land-of-the-lustrous.com/core_sys/images/main/top/top_img.png')
    .setImage('http://land-of-the-lustrous.com/core_sys/images/contents/00000005/base/001.png?1534933411')
    .setFooter('http://land-of-the-lustrous.com/chara/cinnabar.html')
    .addFields([
      {
        name: 'Hardness',
        value: '2.0',
        inline: true,
      },
      {
        name: 'Mineral',
        value: 'Sulfide',
        inline: true,
      },
      {
        name: 'Chemistry',
        value: 'HgS',
        inline: true,
      },
      {
        name: 'Color',
        value: 'Red, brownish-red',
        inline: false,
      },
      {
        name: 'Job',
        value: 'Night Patrol',
        inline: false,
      },
    ]),
};

const getGemAliases = (gems: Gem[]): string[] => {
  const gemAliases = [];
  for (const gem of gems) {
    for (const alias of gem.aliases) {
      gemAliases.push(alias);
    }
  }
  return gemAliases;
};

export const gems = [phos, cinnabar];

export const gemAliases = getGemAliases(gems);
