import React,{useEffect,useState} from 'react';
import Silhoutte from '../../assets/images/person-silhouette.svg';
import styles from './styles.module.css';
import Popper from '@mui/material/Popper';

import {Socket} from 'socket.io-client';
import {Person} from "../../assets/CommonStructs";
// import ParticipantTooltip from '../ParticipantTooltip';




export type ParticipantBotProps = {
    p: Person;
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
        ["fearful","😨"],
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
                open={comment!==null} anchorEl={document.querySelector(`#participant-without-comment-${p.id}`)} 
                placement={"top"} disablePortal={true}
                modifiers={[{name:"arrow",enabled:true},{name:"flip",enabled:false},{name:"preventOverflow",enabled:false}]}>
                <div className={styles["comment-wrapper"]}>
                    <div className={styles["comment"]}>
                        {comment}
                    </div>
                </div>
            </Popper>
            <div className={`${styles["participant-without-comment"]} ${selected ? styles["selected"]:""}`} id={`participant-without-comment-${p.id}`}>
                <div className={styles["participant-reactions"]}>
                    {raisedHand ? (
                        <div className={styles["raised-hand"]}>🖐️</div>
                    ) : (
                        <div className={styles["no-raised-hand"]}>　</div>
                    )
                    }
                    <div className={styles["emotion"]}>{emotion||"🙂"}</div> 
                </div>
                {/* <ParticipantTooltip person={p}> */}
                    <div className={styles["participant-info"]}>
                        <img src={p.imagePath ? `${process.env.REACT_APP_BACKEND_PATH}${p.imagePath}` : Silhoutte} alt={`${p.name} image`} className={styles["participant-icon"]}/>
                        <p style={{fontSize: 20}}>{p.name}</p>
                    </div>
                {/* </ParticipantTooltip> */}
            </div>
        </div>
    );
};

export default ParticipantBot;

