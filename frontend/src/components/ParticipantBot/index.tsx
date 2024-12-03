import React,{useEffect,useState} from 'react';
import Silhoutte from '../../assets/images/person- silhouette.svg';
import styles from './styles.module.css';

import {Socket} from 'socket.io-client';
import {Participant} from "../../assets/structs";



export type ParticipantBotProps = {
    p: Participant;
    socket: Socket|null;
    selected?: boolean;
}

const ParticipantBot : React.FC<ParticipantBotProps> = ({
    p,
    socket,
    selected=false,
}) =>{

    const [emotion,setEmotion] = useState<string|null>(null);
    const [comment,setComment] = useState<string|null>(null);

    useEffect(()=>{
        if(socket){
            socket.on(`emotion-${p.id}`,(data)=>{
                setEmotion(data);
            });

            socket.on(`comment-${p.id}`,(data)=>{
                if (data==="__end-of-stream") {
                    console.log(comment);
                    setTimeout(() => {setComment(null);}, 5000);
                }
                else { if(data==="__start-of-stream") {
                    setComment("");
                } else{
                    setComment((prevComment) => {
                        const updatedComment = prevComment + data;
                        console.log(updatedComment);
                        return updatedComment;
                    });
                }}
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
            {comment ? (
                <p className={styles["comment"]}>{comment}</p>
            ) : (
                <div className={styles["no-comment"]}></div>
            )}
            <div className={`${styles["participant-info"]} ${selected ? styles["selected"]:""}`}>
                <img src={Silhoutte} className={styles["siloutte-image"]}/>
                <p className={styles["participant-name"]}>{p.name}</p>
            </div>
        </div>
    );
};

export default ParticipantBot;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
