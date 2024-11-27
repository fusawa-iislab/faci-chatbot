import React,{useEffect,useState} from 'react';
import Silhoutte from '../../assets/images/person- silhouette.svg';
import styles from './styles.module.css';

import useSocket from '../../hooks/useSocket';
import {Participant} from "../../assets/structs";



export type ParticipantBotProps = {
    p: Participant;
    comment?: string|null; 
}

const ParticipantBot : React.FC<ParticipantBotProps> = ({
    p,
    comment = null,
}) =>{

    const [emotion,setEmotion] = useState<string|null>(null);
    const socket = useSocket();

    useEffect(()=>{
        if(socket){
            socket.on(`emotion-${p.id}`,(data)=>{
                setEmotion(data);
            });
            return ()=>{
                socket.off(`emotion-${p.id}`);
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
