import { Connection } from 'typeorm';
import { EntityOutput } from '../../lib/common/types';

export const handleQueryAll = async (conn: Connection, entity: EntityOutput) => {
  const queries = (await conn
    .createQueryBuilder()
    .select('e')
    .from(entity as never, 'e')
    .getMany()) as EntityOutput[];

  return queries;
};
