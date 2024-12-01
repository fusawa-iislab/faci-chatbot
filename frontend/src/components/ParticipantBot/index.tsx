import React,{useEffect,useState} from 'react';
import Silhoutte from '../../assets/images/person- silhouette.svg';
import styles from './styles.module.css';

import useSocket from '../../hooks/useSocket';
import {Participant} from "../../assets/structs";



export type ParticipantBotProps = {
    p: Participant;
}

const ParticipantBot : React.FC<ParticipantBotProps> = ({
    p,
}) =>{

    const [emotion,setEmotion] = useState<string|null>(null);
    const [comment,setComment] = useState<string|null>(null);
    const socket = useSocket();

    useEffect(()=>{
        if(socket){
            socket.on(`emotion-${p.id}`,(data)=>{
                setEmotion(data);
            });

            socket.on(`comment-${p.id}`,async (data)=>{
                if (data==="nocontent") {
                    await sleep(1000);
                    setComment(null);
                }
                else {
                    setComment((prevComment)=>prevComment+data);
                }
            });

            return ()=>{
                socket.off(`emotion-${p.id}`);
                socket.off(`comment-${p.id}`);
            }
        }
    },[socket]);

    return (
        <div className={styles["participant-wrapper"]}>
            {emotion && 
                <p className={styles["emotion"]}>{emotion}</p>
            }
            {comment && 
                <p className={styles["comment"]}>{comment}</p>
            }
            <img src={Silhoutte} className={styles["siloutte-image"]}/>
            <p className={styles["participant-name"]}>{p.name}</p>
        </div>
    );
};

export default ParticipantBot;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
