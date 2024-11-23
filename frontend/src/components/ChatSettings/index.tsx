import React, { useState } from 'react';
import styles from './styles.module.css';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';

type ParticipantDescription = {
    name: string;
    background: string;
    persona: string;
    type: string;
};

type ChatSettingsProp = {
    SettingDone: boolean,
    setSettingDone: React.Dispatch<React.SetStateAction<boolean>>,
}

const ChatSettings: React.FC<ChatSettingsProp> = ({
    SettingDone,
    setSettingDone,
}) => {
    const [NumberStr, setNumberStr] =useState<string>('');
    const [Pnumber, setPnumber] = useState<number>(0);
    const [PnumberError, setPnumberError] = useState<string | null>("自然数を入力してください");
    const [NumberConfirmed, setNumberConfirmed] = useState<boolean>(false);
    const [participants, setParticipants] = useState<ParticipantDescription[]>([]);

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
            if (NumInput>5) {
                setPnumberError("5人以内にしてください");
                setNumberConfirmed(false);
                return;
            }
            setPnumber(NumInput); 
        }
    };

    const handleNumberConfirm = () => {
        setNumberConfirmed(true);
        setParticipants(Array(Pnumber).fill({ name: '', role: '', persona: '' }));
    };

    const handlePersonChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        index: number,
        field: keyof ParticipantDescription
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
        const title = (document.getElementById('title') as HTMLInputElement)?.value;
        const description = (document.getElementById('description') as HTMLInputElement)?.value;
        const personsdata = participants.map(participant => ({
            type: 'ParticipantBot',
            args:{name:participant.name,background:participant.background,persona:participant.persona}
        }));
        const username = (document.getElementById('yourname') as HTMLInputElement)?.value;
        const userdata = { type: "User", args: { name: username,background:"",persona:"" }};
        personsdata.push(userdata);
        const data = { title, description, personsdata};
        

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
            <form onSubmit={handleInitSubmit}>
                <div className={styles['debate-situation']}>
                    <div className={styles["input-group"]}>
                        <InputLabel htmlFor="your-name">あなたの名前</InputLabel>
                        <Input type="text" required placeholder="名前" id="yourname" />
                    </div>
                    <div className={styles["input-group"]}>
                        <InputLabel htmlFor="title">議題</InputLabel>
                        <Input type="text" required placeholder="議題を入力してください" id="title" />
                    </div>
                    <div className={styles["input-group"]}>
                        <InputLabel htmlFor="description">詳細</InputLabel>
                        <Input type="text" placeholder="何か詳しく伝えたいことがあれば" id="description" />
                    </div>
                </div>
                <div className={styles['participant-number']}>
                    <div className={styles["input-group"]}>
                        <InputLabel htmlFor="p-number">参加者の人数</InputLabel>
                        <div className={styles["input-error-inner"]}>
                            <Input required onChange={handleNumberChange} value={NumberStr} id="p-number"/>
                            {PnumberError && <p className={styles["error"]}>{PnumberError}</p>}
                        </div>
                    </div>
                    <Button onClick={handleNumberConfirm} disabled={Boolean(PnumberError)}>確定</Button>
                </div>
                {NumberConfirmed && (
                    <div className={styles['persons']}>
                        {participants.map((participant,i)=>(
                            <div key={i} className="person-input-container">
                                <p>{i+1}人目</p>
                                <div className={styles["input-group"]}>
                                    <InputLabel htmlFor={`name-${i + 1}`}>名前</InputLabel>
                                    <Input type="text" value={participant.name} onChange={(e) => handlePersonChange(e, i, 'name')} id={`name-${i + 1}`}/>
                                </div>
                                <div className={styles["input-group"]}>
                                    <InputLabel htmlFor={`role-${i + 1}`}>背景</InputLabel>
                                    <Input type="text" value={participant.background} onChange={(e) => handlePersonChange(e, i, 'background')} id={`role-${i + 1}`}/>
                                </div>
                                <div className={styles["input-group"]}>
                                    <InputLabel htmlFor={`persona-${i + 1}`}>属性</InputLabel>
                                    <Input type="text" value={participant.persona} onChange={(e) => handlePersonChange(e, i, 'persona')} id={`persona-${i + 1}`}/>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <Button type="submit" disabled={Boolean(PnumberError) || !NumberConfirmed} className={styles["submit-button"]}>送信</Button>
            </form>
        </div>
    );
};

export default ChatSettings;
