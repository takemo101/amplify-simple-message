import Redis from 'ioredis';
import type { Schema } from '../../../data/resource';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

type MessageEntity = Schema['Message']['type'];

const getList = async () => {
  console.log(process.env);

  try {
    const messages = await redis.lrange('messages', 0, -1);
    return messages.map((m) => JSON.parse(m) as MessageEntity);
  } catch (error) {
    console.error(error);
  }

  return [];
};

const create = async (message: Omit<MessageEntity, 'id'>) => {
  const messages = await getList();

  const maxId = messages.reduce((max, m) => (m.id > max ? m.id : max), 0);

  const createdMessage = {
    id: maxId + 1,
    ...message,
  };

  await redis.rpush('messages', JSON.stringify(createdMessage));

  return createdMessage;
};

const remove = async (id: number) => {
  const messages = await getList();

  const removedMessage = messages.find((m) => m.id === id);

  if (!removedMessage) {
    throw new Error('Message not found');
  }

  await redis.lrem('messages', 0, JSON.stringify(removedMessage));

  return removedMessage;
};

export { getList, create, remove };
