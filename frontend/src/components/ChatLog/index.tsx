import React,{useState} from 'react';
import styles from './styles.module.css';
import Button from '@mui/material/Button';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon  from '@mui/icons-material/ArrowDropUp';
import { ChatData } from '../../assets/structs';

type ChatLogProps = {
    chatdatas?: Array<ChatData>;
}

const ChatLog : React.FC<ChatLogProps> = ({
    chatdatas=[],
}) =>{

    const [ShowChatlog,setShowChatlog] = useState<boolean>(false);

    const handleShowChatlog = () => {
        setShowChatlog(!ShowChatlog);
    }

    return (
        <div className={styles["wrapper"]}>
            <Button onClick={handleShowChatlog} className={styles["toggle-button"]}>
                {ShowChatlog ? 
                    <ArrowDropUpIcon className={styles["toggle-button-icon"]}/> :
                    <ArrowDropDownIcon className={styles["toggle-button-icon"]}/>
                }
            </Button>
            {ShowChatlog &&
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
            }
        </div>
    );
};

export default ChatLog;
