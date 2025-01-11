import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { message } from '../functions/message/resource';

const schema = a.schema({
  // 操作の種類を表す列挙型
  Operation: a.enum(['create', 'remove']),

  // 参照メッセージの型
  Message: a.customType({
    id: a.integer().required(),
    message: a.string().required(),
  }),

  // 操作されたメッセージの型
  OperatedMessage: a.customType({
    id: a.integer().required(),
    message: a.string().required(),
    operation: a.ref('Operation').required(),
  }),

  // メッセージの配列を表す型
  Messages: a.customType({
    messages: a.ref('Message').required().array(),
  }),

  // メッセージの受け取り通知を受けるサブスクリプション
  receiveMessage: a
    .subscription()
    .for([a.ref('createMessage'), a.ref('removeMessage')])
    .authorization((allow) => [allow.publicApiKey()])
    .handler(
      a.handler.custom({
        // サブスクリプションのエントリポイント
        // tsファイルのパスが指定できないため、jsファイルのパスを指定する
        entry: '../functions/message/handlers/receiveMessage.js',
      }),
    ),

  // メッセージの取得を行うクエリ
  getMessages: a
    .query()
    .returns(a.ref('Messages'))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(message)),

  // メッセージの作成を行うミューテーション
  createMessage: a
    .mutation()
    .arguments({
      message: a.string().required(),
    })
    .returns(a.ref('OperatedMessage'))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(message)),

  // メッセージの削除を行うミューテーション
  removeMessage: a
    .mutation()
    .arguments({
      id: a.integer().required(),
    })
    .returns(a.ref('OperatedMessage'))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(message)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    // デフォルトの認証モードをAPIキーに設定しているが
    // もちろんCogntioなど他の認証モードに変更可能
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
