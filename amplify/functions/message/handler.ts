import type { AppSyncResolverHandler } from 'aws-lambda';
import { createMessage } from './handlers/createMessage';
import { getMessages } from './handlers/getMessages';
import { removeMessage } from './handlers/removeMessage';

// フィールド名（amplify data で定義したスキーマ名）と実行ハンドラーのマップ
const handlers = {
  getMessages,
  createMessage,
  removeMessage,
};

/**
 * AppSyncのフィールド名が有効かどうかを型ガードする
 *
 * @param fieldName
 * @returns
 */
const isValidFieldName = (
  fieldName: string,
): fieldName is keyof typeof handlers => {
  return fieldName in handlers;
};

type HandlerArguments = (typeof handlers)[keyof typeof handlers];
type HandlerResult = Awaited<ReturnType<HandlerArguments>>;
type HandlerEvent = Parameters<(typeof handlers)[keyof typeof handlers]>[0];

type Handler = AppSyncResolverHandler<HandlerArguments, HandlerResult>;

export const handler: Handler = async (event, context, callback) => {
  // なぜか型と違うオブジェクトが渡ってくるので、型アサーションする
  const assertedEvent = event as HandlerEvent & {
    fieldName: string;
  };

  const { fieldName } = assertedEvent;

  if (!isValidFieldName(fieldName)) {
    throw new Error(`Invalid field: ${fieldName}`);
  }

  // フィールド名に対応するハンドラーを取得して実行する
  const handler = handlers[fieldName];

  return await handler(
    // @ts-ignore
    event,
    context,
    callback,
  );
};
