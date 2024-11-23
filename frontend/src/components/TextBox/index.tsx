import React from 'react';
import styles from './styles.module.css';

export type TextBoxProps = {
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void,
    inputText: string, // inputTextを受け取る
    setInputText: React.Dispatch<React.SetStateAction<string>>; // setInputTextを受け取る
};

const TextBox: React.FC<TextBoxProps> = ({
    handleSubmit,
    inputText,
    setInputText,
}) => {
    return (
        <form onSubmit={handleSubmit} className={styles["user-input"]}>
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)} // テキストの変更を親のステートに反映
                placeholder="テキストを入力してください"
            />
            <button type="submit">送信</button>
        </form>
    );
};

export default TextBox;
