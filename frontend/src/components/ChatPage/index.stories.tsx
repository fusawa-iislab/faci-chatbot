import React from 'react';
import ChatPage from '.';
import { ChatData } from '../../assets/structs';

// サンプルデータを定義

const sampleChatData: ChatData[] = [
    { id: 1, name: 'Alice', content: 'こんにちは！' },
    { id: 2, name: 'Bob', content: '元気ですか？' },
    { id: 3, name: 'Charlie', content: '今日はどうでしたか？' },
];

// ストーリーの設定
export default {
    title: 'Pages/ChatPage', // Storybookのタイトル
    component: ChatPage,
};

// ストーリーを定義
export const Default = () => {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // リロードを防ぐ
        console.log('送信されました！'); // コンソールにメッセージを表示
    };

    return <ChatPage/>;
};
