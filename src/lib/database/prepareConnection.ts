import { config } from 'dotenv';
import { join } from 'path';
import { createConnection, getConnection } from 'typeorm';

config({ path: join(__dirname, '../../../../process.env') });

export const prepareConnection = async () => {
  try {
    const staleConn = getConnection();
    await staleConn.close();
  } catch (e) {
    console.log('No stale connection to clean up.');
  }
  await createConnection();
  return getConnection();
};
