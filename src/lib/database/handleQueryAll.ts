import { Connection } from 'typeorm';
import { Entity } from '../../lib/common/types';

export const handleQueryAll = async (conn: Connection, entity: Entity) => {
  const queries = (await conn
    .createQueryBuilder()
    .select('e')
    .from(entity as never, 'e')
    .getMany()) as Entity[];

  return queries;
};
