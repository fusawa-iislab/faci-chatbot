import React from 'react';
import styles from './styles.module.css';
import { ChatData } from '../../assets/CommonStructs';

type ChatLogProps = {
    chatdatas?: Array<ChatData>;
    height?: number|string;
}

const ChatLog : React.FC<ChatLogProps> = ({
    chatdatas=[],
    height=300
}) =>{


    return (
        <div className={styles["chatlog-wrapper"]} style={{height: height}}>
            <div className={styles["chatlog-container"]}>
                <div className={styles["chatlog"]}>
                    {chatdatas.map((chatdata,index)=>(
                        <div className={styles["chatdata"]} key={index}>
                            <p className={styles["chat-name"]}>{chatdata.name}:</p>
                            <p className={styles["chat-content"]}>{chatdata.content}
                                {chatdata.status==="STOPPED" && <span className={styles["chat-stopped"]}>STOP</span>}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatLog;
