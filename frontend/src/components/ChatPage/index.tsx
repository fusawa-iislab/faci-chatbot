import React, { useState, useEffect } from 'react'; 
import styles from './styles.module.css';
import Button from '@mui/material/Button';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import ParticipantBot from '../ParticipantBot';
import ChatLog from '../ChatLog';
import SocketTextArea from '../SocketTextArea';
import io from 'socket.io-client';
import { ChatData, Person,Participant } from '../../assets/structs';

const ChatPage: React.FC = () => {

    const [inputText, setInputText] = useState(''); // inputTextの状態を管理
    const [ChatDatas, setChatDatas] = useState<ChatData[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [SelectedPersonID, setSelectedPersonID] = useState(0);
    const [Outsocket, setSocket] = useState<any>(null);
    const [User, setUser] = useState<Person>({name:"",id:-1});


    useEffect(() => {
        const socket = io(`${process.env.REACT_APP_BACKEND_PATH}`);
        setSocket(socket);
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
    }, []);
///////////////////////////////////////////////////////////////////////////////////////////////
    const handleInputSubmit = () => {
        if (inputText === "") {
            alert("テキストを入力してください");
            return;
        }
        var message: string = inputText;
        setInputText("");
        if (Outsocket) {
            const sendData = { text: message, selectedID: SelectedPersonID }
            Outsocket.emit("user-input", sendData)
        }
        return;
    };
/////////////////////////////////////////////////////////////////////////////////////////////////
    const handleSelectPersonID = (id: number) => {
        if (SelectedPersonID === id) setSelectedPersonID(0);
        else setSelectedPersonID(id)
    }


    const SelectedPerson = participants.find(p => p.id === SelectedPersonID)


    return (
        <div className={styles["chatpage-container"]}>
            <div className={styles["chatpage-content"]}>
                <div className={styles["chatlog-container"]} >
                    <ChatLog chatdatas={ChatDatas} />
                </div>
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
                <div className={styles["participants-container"]}>
                    {participants.map((p, index) =>
                        <div className={`${styles["participant"]} ${p.id === SelectedPersonID ? styles["selected"] : ""}`} onClick={() => handleSelectPersonID(p.id)} key={index}>
                            <ParticipantBot name={p.name} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ChatPage;
