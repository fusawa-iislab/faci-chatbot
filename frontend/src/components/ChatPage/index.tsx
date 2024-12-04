import React, { useState, useEffect } from 'react'; 
import styles from './styles.module.css';
import Button from '@mui/material/Button';
// import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import ParticipantBot from '../ParticipantBot';
import ChatLog from '../ChatLog';
import SocketTextArea from '../SocketTextArea';
import useSocket from '../../hooks/useSocket';
import { ChatData, Person,Participant } from '../../assets/structs';

const ChatPage: React.FC = () => {

    const [inputText, setInputText] = useState(''); // inputTextの状態を管理
    const [ChatDatas, setChatDatas] = useState<ChatData[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [SelectedPersonID, setSelectedPersonID] = useState<number|null>(null);
    const [User, setUser] = useState<Person>({name:"",id:-1});
    const [AskForComment, setAskForComment] = useState<boolean>(false);
    const socket = useSocket();

    useEffect(() => {
        if (socket) {
            socket.on('log', (data) => {
                console.log(data.content);
            });
            socket.on("participants", (data) => {
                setParticipants(data);
            });
            socket.on("chatlog",(data)=>{
                setChatDatas(data)
            })
            socket.on("user",(data)=>{
                setUser(data)
            })
            //chatdataの受け取り(リアルタイム)
            socket.on('chatdata', (data) => {
                setChatDatas((prevChatDatas) => [...prevChatDatas, data]);
            });
    

            return () => {
                socket.off('chatdata');
                socket.off('log');
                socket.off("persons");
                socket.off("chatlog");
                socket.off("user");
                socket.disconnect();
            };
        }
    }, [socket]);
//-----------------------------------------------------------------------------------------------//
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
        return;
    };
//-----------------------------------------------------------------------------------------------//
    const handleSelectPersonID = (id: number) => {
        setAskForComment(false); //participantを選択したら発言を求めるのをやめる
        if (SelectedPersonID === id) setSelectedPersonID(null);
        else setSelectedPersonID(id)
    }

    const SelectedPerson = participants.find(p => p.id === SelectedPersonID)

//-----------------------------------------------------------------------------------------------//
    const handleStopClick = () => {
        if (socket) {
            socket.emit("stop-comment", "a")
        }
    }

//-----------------------------------------------------------------------------------------------//
    const handleAskClick = () => {
        setAskForComment(!AskForComment)
    }

//-----------------------------------------------------------------------------------------------//

    return (
        <div className={styles["chatpage-container"]}>
            <div className={styles["chatpage-main"]}>
                <div className={styles["participants-container"]}>
                    {participants.map((p, index) =>
                        <div className={`${styles["participant"]}`} onClick={() => handleSelectPersonID(p.id)} key={index}>
                            <ParticipantBot p={p} socket={socket} selected={p.id===SelectedPersonID}/>
                        </div>
                    )}
                </div>
                <Button className={styles["ask-button"]} onClick={handleAskClick}>ASK</Button>
                <Button className={styles["stop-button"]} onClick={handleStopClick}>STOP</Button>
                <SocketTextArea handleInputSubmit={handleInputSubmit} inputText={inputText} setInputText={setInputText} />
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
            </div>
            <div className={styles["chatlog-wrapper"]}>
                <ChatLog chatdatas={ChatDatas}/>
            </div>
        </div>
    )
}

export default ChatPage;
