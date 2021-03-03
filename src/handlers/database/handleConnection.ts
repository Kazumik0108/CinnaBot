import { config } from 'dotenv';
import { join } from 'path';
import { createConnection, getConnection } from 'typeorm';

config({ path: join(__dirname, '../process.env') });

let connectionReadyPromise: Promise<void> | null = null;

const prepareConnection = async () => {
  if (!connectionReadyPromise) {
    connectionReadyPromise = (async () => {
      try {
        const staleConnection = getConnection();
        await staleConnection.close();
      } catch (e) {
        console.log('No stale connection to clean up.');
      }
      await createConnection();
    })();
  }
  return connectionReadyPromise;
};

export const handleConnection = async () => {
  await prepareConnection();
  return getConnection();
};
