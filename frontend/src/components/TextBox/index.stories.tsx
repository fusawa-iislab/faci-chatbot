import React, { useState } from 'react';
import TextBox from '.';

export default {
    title: 'Components/TextBox', // Storybookのタイトル
    component: TextBox,
};

// ストーリーを定義
export const Default = () => {
    const [inputText, setInputText] = useState(''); // inputTextの状態を管理

    // サンプルの送信ハンドラー
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // ページリロードを防ぐ
        alert(`送信されました！入力内容: ${inputText}`); // アラートを表示
    };

    return (
        <TextBox 
            handleSubmit={handleSubmit} 
            inputText={inputText} // inputTextを渡す
            setInputText={setInputText} // setInputTextを渡す
        />
    );
};
