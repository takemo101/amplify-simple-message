import type { Schema } from '../../../data/resource';
import { create } from './repository';

type Handler = Schema['createMessage']['functionHandler'];

export const createMessage: Handler = async (event) => {
  const message = event.arguments;

  const createdMessage = create(message);

  return {
    operation: 'create',
    ...createdMessage,
  };
};
