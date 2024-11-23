// src/components/ChatLog.stories.tsx
import React from 'react';
import ChatLog from '.';
import { ChatData } from '../../assets/structs';

// IDを追加したサンプルデータを定義
const sampleChatData: ChatData[] = [
    { id: 1, name: 'Alice', content: 'こんにちは！元気ですか？' },
    { id: 2, name: 'Bob', content: '元気だよ！最近どう？' },
    { id: 3, name: 'Alice', content: '忙しいけど、楽しいこともあったよ。' },
    { id: 4, name: 'Charlie', content: '何か面白いことがあったの？' },
    { id: 5, name: 'Alice', content: '実は、先週末に友達と旅行に行ったんだ。' },
    { id: 6, name: 'Bob', content: 'いいね！どこに行ったの？' },
    { id: 7, name: 'Alice', content: '箱根に行って、温泉に入ってきた！最高だったよ。' },
    { id: 8, name: 'Charlie', content: 'それは素晴らしい！私も行きたいな。' },
    { id: 9, name: 'Bob', content: '箱根の温泉は本当にリラックスできるよね。' },
    { id: 10, name: 'Alice', content: 'そうなんだ。次は一緒に行こうよ！' },
    { id: 11, name: 'Charlie', content: 'ぜひ！計画を立てよう。' },
    { id: 12, name: 'Bob', content: '旅行の写真も見せてね！' },
    { id: 13, name: 'Alice', content: 'もちろん！後で送るね。' },
];

export default {
    title: 'Components/ChatLog', // Storybookのタイトル
    component: ChatLog,
};

// ストーリーを定義
export const Default = () => <ChatLog chatdatas={sampleChatData} />;
