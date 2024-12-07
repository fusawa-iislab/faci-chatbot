import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Textarea from '@mui/joy/Textarea';
import Divider from '@mui/material/Divider';

import DefaultSetting from '../DefaultSetting';


export type PersonDescription = {
    name: string,
    background: string,
    persona: string,
};

type InputData = {
    username: string,
    title: string,
    description: string,
    participants: PersonDescription[],
}

type PersonData = {
    type: string,
    args: PersonDescription,
}

type SendData = {
    title: string,
    description: string,
    personsdata: PersonData[],
}

type ChatSettingPageProp = {
    SettingDone: boolean,
    setSettingDone: React.Dispatch<React.SetStateAction<boolean>>,
}

const ChatSettingPage: React.FC<ChatSettingPageProp> = ({
    SettingDone,
    setSettingDone,
}) => {

    const [PageIndex, setPageIndex] = useState<number>(0);
    const [InputGroup,setInputGroup] = useState<InputData>({username: '',title:"",description:"",participants:[]})

    const [NumberStr, setNumberStr] =useState<string>('');
    const [ParticipantNumbers, setParticipantNumber] = useState<{prev:number,current:number}>({prev:0,current:0});
    const [PnumberError, setPnumberError] = useState<string | null>("自然数を入力してください");
    const [NumberConfirmed, setNumberConfirmed] = useState<boolean>(false);

    const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInputGroup(prevState => ({ ...prevState, username: e.target.value }));
    }
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInputGroup(prevState => ({ ...prevState, title: e.target.value }));
    }
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInputGroup(prevState => ({ ...prevState, description: e.target.value }));
    }

    const handleNumberChange = async (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
        const inputValue = e.target.value;
        setNumberStr(inputValue);

        if (/[^0-9]/.test(inputValue)||inputValue==="") {
            setPnumberError('自然数のみを入力してください');
            setNumberConfirmed(false);
        } else {
            setPnumberError(null);
            var NumInput=Number(inputValue)
            if (NumInput <= 0) {
                setPnumberError('参加者の人数は1人以上でなければなりません');
                setNumberConfirmed(false);
                return;
            }
            if (NumInput>10) {
                setPnumberError("10人以内にしてください");
                setNumberConfirmed(false);
                return;
            }
        }
    };

    const handleNumberConfirm = () => {
        setParticipantNumber({prev:ParticipantNumbers.current,current:Number(NumberStr)});
        setNumberConfirmed(true);
    };

    useEffect(() => {
        console.log(ParticipantNumbers);
        if (ParticipantNumbers.current > ParticipantNumbers.prev) {
            const newParticipants = Array.from({ length: ParticipantNumbers.current - ParticipantNumbers.prev }, () => ({ name: '', background: '', persona: '' }));
            setInputGroup(prevState => ({ ...prevState, participants: [...prevState.participants, ...newParticipants] }));
        } else if (ParticipantNumbers.current < ParticipantNumbers.prev) {
            setInputGroup(prevState => ({ ...prevState, participants: prevState.participants.slice(0, ParticipantNumbers.current) }));
        }
    }, [ParticipantNumbers]);

    const handleParticipantChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        index: number,
        field: keyof PersonDescription
    ) => {
        const updatedParticipants = InputGroup.participants.map((participant, i) => {
            if (i === index) {
                return { ...participant, [field]: e.target.value };
            }
            return participant; 
        });
        setInputGroup(prevState => ({ ...prevState, participants: updatedParticipants }));
    };

    const handleInitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const PersonsData: PersonData[] = InputGroup.participants.map(participant => ({
            type: 'ParticipantBot',
            args: participant
        }));
        const UserData: PersonData = { type: "User", args: { name: InputGroup.username, background:"", persona:"" }};
        PersonsData.unshift(UserData);
        const data : SendData= {
             title: InputGroup.title, 
             description: InputGroup.description, 
             personsdata: PersonsData
        };
        
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_PATH}/api/init_setting`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            if (response.ok) {
                console.log('送信が成功しました');
                setSettingDone(true)
            } else {
                console.error('送信に失敗しました');
            }
        } catch (error) {
            console.error('エラーが発生しました:', error);
        }
    };

    return (
        <div className={styles["chat-settings-wrapper"]}>
            <DefaultSetting />
            <div className={styles["form-wrapper"]}>

                {PageIndex === 0 && (
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <div className={styles['conversation-situation']}>
                            <div className={styles["input-group"]}>
                                <InputLabel htmlFor="your-name">あなたの名前:</InputLabel>
                                <Input type="text" required placeholder="名前" id="yourname" onChange={handleUserNameChange} value={InputGroup.username}/>
                            </div>
                            <div className={styles["input-group"]+" "+styles["column"]}>
                                {/* <InputLabel htmlFor="title">議題</InputLabel> */}
                                <InputLabel htmlFor="title">議題:</InputLabel>
                                <Textarea required placeholder="何か議題を設定してください" id="title" minRows={2} className={styles["title"]}  onChange={handleTitleChange} value={InputGroup.title} />
                            </div>
                            <div className={styles["input-group"]+" "+styles["column"]}>
                                <InputLabel htmlFor="description">詳細:</InputLabel>
                                <Textarea placeholder="詳細を記入してください" id="description" minRows={2} className={styles["description"]} onChange={handleDescriptionChange} value={InputGroup.description}/>
                            </div>
                            <div className={styles['participant-number']}>
                                <div className={styles["input-group"]}>
                                    <InputLabel htmlFor="p-number">参加者の人数:</InputLabel>
                                    <div className={styles["input-error-inner"]}>
                                        <Input required onChange={handleNumberChange} value={NumberStr} id="p-number"/>
                                        {PnumberError && <p className={styles["error"]}>{PnumberError}</p>}
                                    </div>
                                </div>
                                <Button onClick={handleNumberConfirm} disabled={Boolean(PnumberError)}>確定</Button>
                            </div>
                        </div>
                        <Divider />
                        {NumberConfirmed && (
                            <div className={styles['participants-container']}>
                                {InputGroup.participants.map((participant,i)=>(
                                    <div key={i} className={styles["participant-input-container"]}>
                                        <p>{i+1}人目</p>
                                        <div className={styles["input-group"]}>
                                            <InputLabel htmlFor={`name-${i + 1}`}>名前:</InputLabel>
                                            <Input type="text" value={participant.name} onChange={(e) => handleParticipantChange(e, i, 'name')} id={`name-${i + 1}`}/>
                                        </div>
                                        <div className={styles["input-group"]}>
                                            <InputLabel htmlFor={`role-${i + 1}`}>背景:</InputLabel>
                                            <Input type="text" value={participant.background} onChange={(e) => handleParticipantChange(e, i, 'background')} id={`role-${i + 1}`}/>
                                        </div>
                                        <div className={styles["input-group"]}>
                                            <InputLabel htmlFor={`persona-${i + 1}`}>属性:</InputLabel>
                                            <Input type="text" value={participant.persona} onChange={(e) => handleParticipantChange(e, i, 'persona')} id={`persona-${i + 1}`}/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className={styles["next-button-wrapper"]}>
                            <Button disabled={Boolean(PnumberError) || !NumberConfirmed} className={styles["next-button"]} onClick={() => setPageIndex(1)}>次へ</Button>
                        </div>
                    </div>
                )}

                {PageIndex === 1 && (
                    <div style={{display: "flex", flexDirection: "column", alignItems:"center", width: "100%"}}>
                        <div className={styles["back-button-wrapper"]}>
                            <Button className={styles["back-button"]} onClick={() => setPageIndex(0)}>戻る</Button>
                        </div>
                        
                        <div className={styles["submit-button-wrapper"]}>
                            <Button disabled={Boolean(PnumberError) || !NumberConfirmed} className={styles["submit-button"]} onClick={handleInitSubmit} >送信</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatSettingPage;
