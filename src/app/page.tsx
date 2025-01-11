import { Amplify } from 'aws-amplify';

import outputs from '~/amplify_outputs.json';
import { MessageSection } from '../components';
import { serverClient } from '../utils';

Amplify.configure(outputs);

// amplify backend で定義したクエリでメッセージの初期データを取得
const getInitialMessages = async () => {
  const { data, errors } = await serverClient.queries.getMessages();

  if (errors) {
    throw new Error(errors[0].message);
  }

  if (!data) {
    throw new Error('No data returned');
  }

  return data.messages ?? [];
};

export default async function App() {
  const messages = await getInitialMessages();

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] justify-items-center p-8 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center">
        <h1 className="mb-10 font-bold text-4xl">超シンプルなチャット？</h1>
        <MessageSection initialMessages={messages} />
      </main>
    </div>
  );
}
