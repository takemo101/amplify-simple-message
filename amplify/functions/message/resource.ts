import { defineFunction } from '@aws-amplify/backend';

export const message = defineFunction({
  name: 'message',
  runtime: 22,
});
