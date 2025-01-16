import React, { useState, useEffect } from 'react'; 
import styles from './styles.module.css';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import ClearIcon from '@mui/icons-material/Clear';

import ParticipantBot from '../ParticipantBot';
import ChatLog from '../ChatLog';
import SocketTextArea from '../SocketTextArea';
import CountUpTimer from '../CountUpTimer';
import InfoList from '../InfoList';
import useSocket from '../../hooks/useSocket';
import { ChatData, Person, SituationDescription} from '../../assets/CommonStructs';

type ChatPageInitDataProps = {
    participants: Person[];
    situation: SituationDescription;
    user: {
        name: string;
        id: number;
    };
    chatlog: ChatData[];
}


const ChatPage: React.FC = () => {

    const [inputText, setInputText] = useState(''); // inputTextの状態を管理
    const [ChatDatas, setChatDatas] = useState<ChatData[]>([]);
    const [participants, setParticipants] = useState<Person[]>([]);
    const [SelectedPersonID, setSelectedPersonID] = useState<number|null>(null);
    const [situation, setSituation] = useState<SituationDescription>({title:"",description:""});
    const [User, setUser] = useState<{name: string; id: number}>({name:"",id:-1});
    const [AskForComment, setAskForComment] = useState<boolean>(false);
    const [ShowChatlog, setShowChatlog] = useState<boolean>(false);
    const [ShowDrawer, setShowDrawer] = useState<boolean>(false);
    const socket = useSocket();

    useEffect(() => {
        if (socket) {
            socket.on('log', (data) => {
                console.log(data.content);
            });
            //chatdataの受け取り(リアルタイム)
            socket.on('chatdata', (data: ChatData) => {
            setChatDatas((prevChatDatas) => [...prevChatDatas, data]);
            });    
            return () => {
                socket.off('chatdata');
                socket.off('log');
                socket.disconnect();
            };
        }
    }, [socket]);

    useEffect(() => {
        const fetchData = async () => {
            const response=await fetch(`${process.env.REACT_APP_BACKEND_PATH}/api/chatpage-init`)
            const data: ChatPageInitDataProps = await response.json();
            return data
        };
        const ChatPageInitData=fetchData();

        ChatPageInitData.then((data)=>{
            setParticipants(data.participants);
            setSituation(data.situation);
            setUser({name:data.user.name,id:data.user.id});
            setChatDatas(data.chatlog);
        });
    }, []);

    const handleInputSubmit = () => {
        if (inputText === "") {
            alert("テキストを入力してください");
            return;
        }
        var message: string = inputText;
        setInputText("");
        if (socket) {
            const sendData = { text: message, selectedID: SelectedPersonID, askForComment: AskForComment }
            socket.emit("user-input", sendData)
        }
        setSelectedPersonID(null)
        setAskForComment(false)
        return;
    };

    const handleSelectPersonID = (id: number) => {
        setAskForComment(false); //participantを選択したら発言を求めるのをやめる
        if (SelectedPersonID === id) setSelectedPersonID(null);
        else setSelectedPersonID(id)
    }

    const SelectedPerson = participants.find(p => p.id === SelectedPersonID)


    const handleStopClick = () => {
        if (socket) {
            socket.emit("stop-comment", "a")
        }
    }


    const handleAskClick = () => {
        if (AskForComment) setAskForComment(false);
        else {
            if (SelectedPersonID) {
                alert("選択を解除して下さい");
            }
            else {
                setAskForComment(true);
            }
        }
    }



    const handleShowChatlog = () => {
        setShowChatlog(!ShowChatlog);
    }

    return (
        <div className={styles["chatpage-container"]}>
            <div className={styles["chatpage-main"]}>
                <div style={{display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center"}}>
                    <h1>Chat Page</h1>
                    <div style={{display:"flex", flexDirection:"row", alignItems:"center", gap:10}}>
                        <CountUpTimer/>
                        <Button onClick={() => setShowDrawer(!ShowDrawer)}>
                            <MenuOpenIcon sx={{color: "gray"}}/>
                        </Button>
                    </div>
                </div>
                <div className={styles["participants-container"]}>
                    {participants.map((p, index) =>
                        <div className={styles["participant"]} onClick={() => handleSelectPersonID(p.id)} key={index}>
                            <ParticipantBot p={p} socket={socket} selected={p.id===SelectedPersonID}/>
                        </div>
                    )}
                </div>

                <div className={styles["use-input-conatiner"]}>
                    <div className={styles["control-buttons"]}>
                        <Button className={`${styles["ask-button"]} ${AskForComment ? styles["active"] : ""}`} onClick={handleAskClick}>ASK</Button>
                        <Button className={styles["stop-button"]} onClick={handleStopClick}>STOP</Button>
                    </div>
                    <SocketTextArea handleInputSubmit={handleInputSubmit} inputText={inputText} setInputText={setInputText} />
                </div>

                {User.id!==-1&&
                    <p>あなたは{User.name}です。</p>
                }
                <div>
                    {SelectedPerson ? (
                        <p>{SelectedPerson.name}を選択しました</p>
                    ) : (
                        <p>全体に話します。</p>
                    )}
                </div>
                <Button onClick={() => window.location.assign('/review')} className={styles["review-button"]}>Review</Button>
            </div>
            <div className={styles["chatlog-wrapper"]}>
                <Button onClick={handleShowChatlog} className={styles["toggle-button"]}>
                    {ShowChatlog ? 
                        <ExpandLess className={styles["toggle-button-icon"]}/> :
                        <ExpandMore className={styles["toggle-button-icon"]}/>
                    }
                </Button>   
                {ShowChatlog &&
                    <ChatLog chatdatas={ChatDatas} />
                }
            </div>
            <Drawer anchor="right" open={ShowDrawer} variant="persistent" onClose={() => setShowDrawer(false)} sx={{'& .MuiDrawer-paper': {width: 300, pt: 1},}}>
                <Button onClick={() => setShowDrawer(false)} className={styles["drawer-close-button"]}>
                    <ClearIcon sx={{color: "gray", alignSelf: "start"}}/>
                </Button>
                <InfoList title={situation.title} description={situation.description} participants={participants}/>
            </Drawer>
        </div>
    )
}

export default ChatPage;




