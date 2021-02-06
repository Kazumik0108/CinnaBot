// reactions.ts
interface reactionGroup {
    name: string;
    emotes: Array<string>;
}

export const reactions: Array<reactionGroup> = [
    {
        name: 'rinhi',
        emotes: [
            '<:RinHi:725291274013376553>',
        ],
    },
    {
        name: 'rinsway',
        emotes: [
            '<a:RinSway:797263981064486913>', '<a:RinSwayHyper:797263981059375154>', '<a:RinSwayHypest:797263977838673930>',
        ],
    },
    {
        name: 'rinthonk',
        emotes: [
            '<:RinThonk:725015586785984603>', '<a:RinThonkPat:784501878876274718>',
        ],
    },
    {
        name: 'wantramen',
        emotes: [
            '<:waNTRamen:728435282709446727>',
        ],
    },
];