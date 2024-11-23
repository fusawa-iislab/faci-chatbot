import React from 'react';
import styles from './styles.module.css';
import { ChatData } from '../../assets/structs';

type ChatLogProps = {
    chatdatas?: Array<ChatData>;
}

const ChatLog : React.FC<ChatLogProps> = ({
    chatdatas=[],
}) =>{
    return (
        <div className={styles["chatlog-wrapper"]}>
            <div className={styles["chatlog-container"]}>
                <div className={styles["chatlog"]}>
                    {chatdatas.map((chatdata,index)=>(
                        <div className={styles["chatdata"]} key={index}>
                            <p className={styles["chat-name"]}>{chatdata.name}:</p>
                            <p className={styles["chat-content"]}>{chatdata.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatLog;
