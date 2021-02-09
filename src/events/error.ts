// error.ts
export default async (error: Error): Promise<void> => {
    console.log('An error occurred trying to start up: ', error);
};