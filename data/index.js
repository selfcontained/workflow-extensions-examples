import redis from "redis";
import { promisify } from "util";

export const configureData = () => {
  const client = redis.createClient(process.env.REDIS_URL);

  const asyncSet = promisify(client.set).bind(client);
  const asyncGet = promisify(client.get).bind(client);

  return {
    on: client.on.bind(client),
    get: async (key) => {
      const value = await asyncGet(key);

      return JSON.parse(value);
    },
    set: (key, value) => {
      return asyncSet(key, JSON.stringify(value));
    },
    getCredentialId: ({ userId, teamId }) => `${teamId}:${userId}`,
  };
};
