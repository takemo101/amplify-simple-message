import type { Schema } from '../../../data/resource';
import { remove } from './repository';

type Handler = Schema['removeMessage']['functionHandler'];

export const removeMessage: Handler = async (event) => {
  const id = event.arguments.id;

  const removedMessage = remove(id);

  return {
    operation: 'remove',
    ...removedMessage,
  };
};
