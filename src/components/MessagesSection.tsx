'use client';

import type { Schema } from '@amplify/data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { useEffect, useState } from 'react';
import outputs from '~/amplify_outputs.json';

Amplify.configure(outputs, { ssr: true });

const client = generateClient<Schema>();

// amplify backend で定義した方をフロントでそのまま使えるのは嬉しい
export type Messages = NonNullable<Schema['Messages']['type']['messages']>;

type MessageSectionProps = {
  initialMessages: Messages;
};

export const MessageSection = ({ initialMessages }: MessageSectionProps) => {
  // 初期値をpropsから受け取るには key などの指定が必要だが
  // 今回はめんどくさいのでそのまま
  const [messages, setMessages] = useState<Messages>(initialMessages);

  // メッセージの受け取り通知を受ける
  const receiveMessage = () => {
    return client.subscriptions.receiveMessage().subscribe({
      next: (message) => {
        // 作成操作の場合はメッセージを追加
        if (message.operation === 'create') {
          setMessages((prev) => [...prev, message]);
          return;
        }

        // 削除操作の場合はメッセージを削除
        if (message.operation === 'remove') {
          setMessages((prev) => prev.filter((m) => m.id !== message.id));
          return;
        }
      },
    });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // 戻り値をunsubscribe関数として受け取り
    // コンポーネントがアンマウントされたときにunsubscribeする
    const unsubscribe = receiveMessage();

    return () => {
      unsubscribe.unsubscribe();
    };
  }, []);

  const createMessage = () => {
    const message = window.prompt('please enter a message');

    if (!message) {
      return;
    }

    // amplify backend で定義したメッセージのミューテーションを
    // フロントでそのまま呼び出せるのは便利
    client.mutations.createMessage({
      message,
    });
  };

  const removeMessage = (id: number) => {
    client.mutations.removeMessage({
      id,
    });
  };

  return (
    <div className="flex flex-col items-center rounded-md border-2 border-white p-8">
      <button
        type="button"
        className="mb-8 rounded-md bg-blue-500 px-4 py-2 text-white"
        onClick={createMessage}
      >
        メッセージ作成
      </button>
      <div className="w-[300px]">
        <div className="flex flex-col">
          <ul className="flex flex-col items-start gap-4">
            {messages.map((message) => (
              <li
                key={message.id}
                className="w-full cursor-pointer break-words text-lg hover:underline"
                onClick={() => removeMessage(message.id)}
              >
                {message.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
