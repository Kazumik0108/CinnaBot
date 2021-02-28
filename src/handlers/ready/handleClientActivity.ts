import { ClientUser } from 'discord.js';

import { botStatuses } from '../../info/botStatuses';

export const handleClientActivity = async (user: ClientUser) => {
  const activity = botStatuses[Math.floor(Math.random() * botStatuses.length)];
  await user
    .setActivity(activity.activity, { type: activity.id })
    .catch((e) => console.log(`Failed to set the activity of ${user}: `, e));
};
