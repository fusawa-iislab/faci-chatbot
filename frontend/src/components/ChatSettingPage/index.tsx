import React, { useState } from 'react';
import styles from './styles.module.css';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Textarea from '@mui/joy/Textarea';
import Divider from '@mui/material/Divider';




export type PersonDescription = {
    name: string;
    background: string;
    persona: string;
};

type PersonData = {
    type: string;
    args: PersonDescription;
}

type SettingData = {
    title: string;
    description: string;
    personsdata: PersonData[];
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
    const [UserName, setUserName] = useState<string>('');
    const [Title, setTitle] = useState<string>('');
    const [Description, setDescription] = useState<string>('');
    const [NumberStr, setNumberStr] =useState<string>('');
    const [Pnumber, setPnumber] = useState<number>(0);
    const [PnumberError, setPnumberError] = useState<string | null>("自然数を入力してください");
    const [NumberConfirmed, setNumberConfirmed] = useState<boolean>(false);
    const [participants, setParticipants] = useState<PersonDescription[]>([]);

    const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setUserName(e.target.value);
    }
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTitle(e.target.value);
    }
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDescription(e.target.value);
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
            setPnumber(NumInput); 
        }
    };

    const handleNumberConfirm = () => {
        setNumberConfirmed(true);
        setParticipants(Array(Pnumber).fill({ name: '', background: '', persona: '' }));
    };

    const handlePersonChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        index: number,
        field: keyof PersonDescription
    ) => {
        const updatedPersons = participants.map((participant, i) => {
            if (i === index) {
                return { ...participant, [field]: e.target.value };
            }
            return participant; 
        });
        setParticipants(updatedPersons);
    };

    const handleInitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const personsdata = participants.map(participant => ({
            type: 'ParticipantBot',
            args:{
                name : participant.name,
                background : participant.background,
                persona : participant.persona
            }
        }));
        const userdata = { type: "User", args: { name: UserName, background:"", persona:"" }};
        personsdata.push(userdata);
        const data : SettingData= {
             title: Title, 
             description: Description, 
             personsdata: personsdata
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
            <form onSubmit={handleInitSubmit} className={styles["form-wrapper"]}>

                {PageIndex === 0 && (
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <div className={styles['conversation-situation']}>
                            <div className={styles["input-group"]}>
                                <InputLabel htmlFor="your-name">あなたの名前:</InputLabel>
                                <Input type="text" required placeholder="名前" id="yourname" onChange={handleUserNameChange} value={UserName}/>
                            </div>
                            <div className={styles["input-group"]+" "+styles["column"]}>
                                {/* <InputLabel htmlFor="title">議題</InputLabel> */}
                                <InputLabel htmlFor="title">議題:</InputLabel>
                                <Textarea required placeholder="何か議題を設定してください" id="title" minRows={2} className={styles["title"]}  onChange={handleTitleChange} value={Title} />
                            </div>
                            <div className={styles["input-group"]+" "+styles["column"]}>
                                <InputLabel htmlFor="description">詳細:</InputLabel>
                                <Textarea placeholder="詳細を記入してください" id="description" minRows={2} className={styles["description"]} onChange={handleDescriptionChange} value={Description}/>
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
                                {participants.map((participant,i)=>(
                                    <div key={i} className={styles["participant-input-container"]}>
                                        <p>{i+1}人目</p>
                                        <div className={styles["input-group"]}>
                                            <InputLabel htmlFor={`name-${i + 1}`}>名前:</InputLabel>
                                            <Input type="text" value={participant.name} onChange={(e) => handlePersonChange(e, i, 'name')} id={`name-${i + 1}`}/>
                                        </div>
                                        <div className={styles["input-group"]}>
                                            <InputLabel htmlFor={`role-${i + 1}`}>背景:</InputLabel>
                                            <Input type="text" value={participant.background} onChange={(e) => handlePersonChange(e, i, 'background')} id={`role-${i + 1}`}/>
                                        </div>
                                        <div className={styles["input-group"]}>
                                            <InputLabel htmlFor={`persona-${i + 1}`}>属性:</InputLabel>
                                            <Input type="text" value={participant.persona} onChange={(e) => handlePersonChange(e, i, 'persona')} id={`persona-${i + 1}`}/>
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
                            <Button type="submit" disabled={Boolean(PnumberError) || !NumberConfirmed} className={styles["submit-button"]}>送信</Button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default ChatSettingPage;
