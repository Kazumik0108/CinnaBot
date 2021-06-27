import { GuildEntity } from '../../../entity';

export async function hasRecords(record: GuildEntity) {
  return !(isEmpty(record.channels) && isEmpty(record.embeds) && isEmpty(record.reactions) && isEmpty(record.roles));
}

function isEmpty(o: unknown[]) {
  return o instanceof Array ? o.length == 0 : true;
}
