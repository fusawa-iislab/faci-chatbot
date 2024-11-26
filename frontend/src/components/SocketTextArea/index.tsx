import React from 'react';
import styles from './styles.module.css';
import PublishIcon from '@mui/icons-material/Publish';

export type SocketTextAreaProps = {
    handleInputSubmit: () => void,
    inputText: string, // inputTextを受け取る
    setInputText: React.Dispatch<React.SetStateAction<string>>; // setInputTextを受け取る
};

const SocketTextArea: React.FC<SocketTextAreaProps> = ({
    handleInputSubmit,
    inputText,
    setInputText,
}) => {
    return (
        <div className={styles['textbox-wrapper']}>
            <textarea className={styles["input-textarea"]} value={inputText} onChange={(e) => setInputText(e.target.value)} wrap="soft" />
            <button className={styles["submit-button"]} type="button" onClick={handleInputSubmit}><PublishIcon className={styles["submit-icon"]}/></button>
        </div>
    );
};

export default SocketTextArea;

