import React from 'react';
import ParticipantBot from '.';

// サンプルデータを定義
const sampleParticipants = [
    { name: 'Alice', comment: 'こんにちは！', emoji: '😊', selected: false },
    { name: 'Bob', comment: '元気ですか？', emoji: '🤗', selected: true }, // 例として選択された参加者
    { name: 'Charlie', comment: '今日はどうでしたか？', emoji: '😄', selected: false },
];

export default {
    title: 'Components/ParticipantBot', // Storybookのタイトル
    component: ParticipantBot,
};

// ストーリーを定義
export const Default = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sampleParticipants.map((participant, index) => (
            <ParticipantBot key={index} name={participant.name}/>
        ))}
    </div>
);
