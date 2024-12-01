import React,{useEffect,useState} from 'react';
import Silhoutte from '../../assets/images/person- silhouette.svg';
import styles from './styles.module.css';

import {Socket} from 'socket.io-client';
import {Participant} from "../../assets/structs";



export type ParticipantBotProps = {
    p: Participant;
    socket: Socket|null;
}

const ParticipantBot : React.FC<ParticipantBotProps> = ({
    p,
    socket,
}) =>{

    const [emotion,setEmotion] = useState<string|null>(null);
    const [comment,setComment] = useState<string|null>(null);

    useEffect(()=>{
        if(socket){
            socket.on(`emotion-${p.id}`,(data)=>{
                setEmotion(data);
            });

            socket.on(`comment-${p.id}`,async (data)=>{
                if (data==="end-of-stream") {
                    console.log(comment);
                    await sleep(1000);
                    setComment(null);
                    console.log(comment);
                }
                else {
                    setComment((prevComment)=>prevComment+data);
                    console.log(comment);
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
