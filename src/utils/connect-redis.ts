import { createClient } from 'redis';
import config from 'config';

export const redisClient = createClient({
  socket: {
    host: config.get<string>('redisHost'),
    port: config.get<number>('redisPort'),
  },
  password: config.get<string>('redisPassword'),
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connect to Redis successfully.');
  } catch (error: any) {
    console.log(error.message);
    setTimeout(connectRedis, 5000);
  }
};

redisClient.on('error', err => console.log(err));

export default connectRedis;
