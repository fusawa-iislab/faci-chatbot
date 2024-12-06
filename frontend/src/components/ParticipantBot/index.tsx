import React,{useEffect,useState} from 'react';
import Silhoutte from '../../assets/images/person- silhouette.svg';
import styles from './styles.module.css';
import Popper from '@mui/material/Popper';

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

    const emotionsMap: Map<string,string> = new Map([
        ["angry","😡"],
        ["fearful","🫢"],
        ["happy","😊"],
        ["sad","😢"],
        ["surprised","😲"],
        ["neutral","🙂"],
    ]);

    const [emotion,setEmotion] = useState<string|null>(emotionsMap.get("neutral") || "🙂");
    const [comment,setComment] = useState<string|null>(null);
    const [raisedHand,setRaisedHand] = useState<boolean>(false);

    useEffect(()=>{
        if(socket){
            socket.on(`emotion-${p.id}`,(data)=>{
                setEmotion(emotionsMap.get(data) || null);
            });

            socket.on(`comment-${p.id}`,(data)=>{
                if (data==="__end-of-stream") {
                    console.log(comment);
                    setTimeout(() => {setComment(null);}, 5000);
                }
                else { if(data==="__start-of-stream") {
                    setComment("");
                } else{
                    setComment((prevComment) => prevComment + data);
                }}
            });

            socket.on(`raise-hand-${p.id}`,(data)=>{
                setRaisedHand(data);
            })

            return ()=>{
                socket.off(`emotion-${p.id}`);
                socket.off(`comment-${p.id}`);
            }
        }
    },[socket]);


    return (
        <div className={styles["participant-wrapper"]}>
            <Popper 
                open={comment!==null} anchorEl={document.querySelector(`.${styles["participant-without-comment"]}`)} 
                placement={"top"} disablePortal={true}
                modifiers={[{name:"arrow",enabled:true},{name:"flip",enabled:false}]}>
                <div className={styles["comment-wrapper"]}>
                    <div className={styles["comment"]}>
                        {comment}
                    </div>
                </div>
            </Popper>
            {/* space for comment */}
            <div style={{height:50,width:1}} ></div>
            <div className={styles["participant-without-comment"]}>
                <div className={styles["participant-reactions"]}>
                    {raisedHand ? (
                        <div className={styles["raised-hand"]}>🖐️</div>
                    ) : (
                        <div className={styles["no-raised-hand"]}>　</div>
                    )
                    }
                    <p className={styles["emotion"]}>{emotion||"🙂"}</p> 
                </div>
                <div className={`${styles["participant-info"]} ${selected ? styles["selected"]:""}`}>
                    <img src={Silhoutte} className={styles["siloutte-image"]}/>
                    <p className={styles["participant-name"]}>{p.name}</p>
                </div>
            </div>
        </div>
    );
};

export default ParticipantBot;

