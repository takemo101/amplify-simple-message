import type { Schema } from '../../../data/resource';
import { getList } from './repository';

type Handler = Schema['getMessages']['functionHandler'];

export const getMessages: Handler = async () => {
  return {
    messages: getList(),
  };
};
