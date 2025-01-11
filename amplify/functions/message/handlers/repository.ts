import type { Schema } from '../../../data/resource';

type MessageEntity = Schema['Message']['type'];

const messages: MessageEntity[] = [
  {
    id: 1,
    message: 'こんにちわ！',
  },
  {
    id: 2,
    message: 'さようなら！',
  },
];

const getList = (): MessageEntity[] => {
  return messages;
};

const create = (message: Omit<MessageEntity, 'id'>): MessageEntity => {
  const maxId = messages.reduce((max, m) => (m.id > max ? m.id : max), 0);

  const createdMessage = {
    id: maxId + 1,
    ...message,
  };

  messages.push(createdMessage);

  return createdMessage;
};

const remove = (id: number): MessageEntity => {
  const index = messages.findIndex((m) => m.id === id);
  if (index === -1) {
    throw new Error(`Message not found: ${id}`);
  }

  const [removedMessage] = messages.splice(index, 1);

  return removedMessage;
};

export { getList, create, remove };
