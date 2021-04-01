import { config } from 'dotenv';
import { join } from 'path';
import { handleClientInitialization } from './handlers/handleClientInitialization';

config({ path: join(__dirname, '../process.env') });

const main = async () => {
  const client = await handleClientInitialization();
  client.login(process.env.CLIENT_TOKEN);

  process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection: ', error);
  });

  // await handleTwitterInitialization(client);
};

main();
