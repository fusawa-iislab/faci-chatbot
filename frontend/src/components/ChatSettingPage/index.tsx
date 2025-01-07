import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Textarea from '@mui/joy/Textarea';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';




import {PersonDescription} from "../../assets/CommonStructs";
import ParticipantsSetting from '../ParticipantsSetting';
// import TimeSelector from '../TimeSelector';



export type InputData = {
    username: string,
    title: string,
    description: string,
    participants: PersonDescription[],
    // time: {minute: string, second: string},
}

type PersonData = {
    type: string,
    args: PersonDescription,
}

type SendData = {
    title: string,
    description: string,
    personsdata: PersonData[],
    // time: {minute: string, second: string},
}




const ChatSettingPage: React.FC= () => {

    const [PageIndex, setPageIndex] = useState<number>(0);
    const [InputGroup,setInputGroup] = useState<InputData>({username: '',title:"薬物依存治療グループセラピー",
                                                            description:"薬物依存症の人が集まってファシリテータのもと、直近の薬物の使用経験について話し合います。",
                                                            participants:[]});

    const [NumberStr, setNumberStr] =useState<string>('0');
    const [PNumber, setPNumber] = useState<number>(0);
    const [PnumberError, setPnumberError] = useState<string | null>("自然数を入力してください");

    const [canSubmit, setCanSubmit] = useState<boolean>(false);



    const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInputGroup(prevState => ({ ...prevState, username: e.target.value }));
    }

    // const handleTimeChange = (minute: string, second: string) => {
    //     console.log(minute, second);
    //     setInputGroup(prevState => ({ ...prevState, time: {minute: minute, second: second} }));
    // }

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
            setPnumberError('1から10の自然数を入力してください');
            setPNumber(0);
        } else {
            setPnumberError(null);
            var NumInput=Number(inputValue)
            if (NumInput <= 0) {
                setPnumberError('参加者の人数は1人以上でなければなりません');
                setPNumber(0);
                return;
            }
            if (NumInput>10) {
                setPnumberError("10人以内にしてください");
                setPNumber(0);
                return;
            }
            setPNumber(NumInput);
            return;
        }
    };

    useEffect(() => {
        if (InputGroup.participants.length < PNumber) {
            const newParticipants = Array.from({ length: PNumber - InputGroup.participants.length }, () => ({
                name: '',
                persona: '',
            }));
            setInputGroup(prevState => ({ ...prevState, participants: [...InputGroup.participants, ...newParticipants] }));
        }
        if (InputGroup.participants.length > PNumber) {
            setInputGroup(prevState => ({ ...prevState, participants: InputGroup.participants.slice(0, PNumber) }));
        }
    }, [PNumber]);

    useEffect(() => {
        if (InputGroup.username === "" || InputGroup.title === "" ) {
            setCanSubmit(false);
            return;
        }
        for (const participant of InputGroup.participants) {
            if (participant.name === "" || participant.persona === "") {
            setCanSubmit(false);
            return;
            }
        }
        setCanSubmit(true);
    }, [InputGroup]);


    const handleInitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const PersonsData: PersonData[] = InputGroup.participants.map(participant => ({
            type: 'ParticipantBot',
            args: participant
        }));
        const UserData: PersonData = { type: "User", args: { name: InputGroup.username, persona:"" }};
        PersonsData.unshift(UserData);
        const data : SendData= {
             title: InputGroup.title, 
             description: InputGroup.description, 
             personsdata: PersonsData,
            //  time: InputGroup.time
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
                window.location.assign('/chatpage');
            } else {
                console.error('送信に失敗しました');
            }
        } catch (error) {
            console.error('エラーが発生しました:', error);
        }
    };


    return (
        <div className={styles["chat-setting-wrapper"]}>
            <div className={styles["form-wrapper"]}>
                {PageIndex === 0 && (
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <div className={styles['conversation-situation']}>
                            <div className={styles["input-group"]}>
                                <InputLabel htmlFor="your-name">あなたの名前:</InputLabel>
                                <Input type="text" placeholder="名前" id="yourname" onChange={handleUserNameChange} value={InputGroup.username}/>
                            </div>
                            <Divider/>
                            {/* <div className={styles["input-group"]}>
                                <TimeSelector handleTimeChange={handleTimeChange} time={InputGroup.time}/>
                            </div> */}
                            <Divider/>
                            <div className={styles["input-group"]+" "+styles["column"]}>
                                {/* <InputLabel htmlFor="title">議題</InputLabel> */}
                                <InputLabel htmlFor="title">タイトル:</InputLabel>
                                <Textarea required placeholder="何か議題を設定してください" id="title" minRows={2} maxRows={4} className={styles["title"]}  onChange={handleTitleChange} value={InputGroup.title} />
                            </div>
                            <div className={styles["input-group"]+" "+styles["column"]}>
                                <InputLabel htmlFor="description">詳細:</InputLabel>
                                <Textarea placeholder="詳細を記入してください" id="description" minRows={2}  maxRows={4} className={styles["description"]} onChange={handleDescriptionChange} value={InputGroup.description}/>
                            </div>
                            <div className={styles['participant-number']}>
                                <div className={styles["input-group"]}>
                                    <InputLabel htmlFor="p-number">参加者の人数:</InputLabel>
                                    <div className={styles["input-error-inner"]}>
                                        <Input required onChange={handleNumberChange} value={NumberStr} id="p-number"/>
                                        {PnumberError && <p className={styles["error"]}>{PnumberError}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Divider />
                        {InputGroup.participants.length!==0 && (
                            <div>
                                <div className={styles['participants-container']}>
                                    <ParticipantsSetting InputGroup={InputGroup} setInputGroup={setInputGroup}/>
                                </div>
                            </div>
                        )}
                        <Button disabled={Boolean(PnumberError) || PNumber===0} className={styles["next-button"]} onClick={() => setPageIndex(1)}>次へ</Button>
                    </div>
                )}

                {PageIndex === 1 && (
                    <div style={{display: "flex", flexDirection: "column", alignItems:"center", width: "100%"}}>
                        <Button className={styles["back-button"]} onClick={() => setPageIndex(0)}>戻る</Button>

                        <div className={styles["setting-confirm-content"]}>
                            <dl>
                                <dt>あなたの名前:</dt>
                                {InputGroup.username === "" ?
                                    <dd style={{color: "red", fontSize: 20}}>未設定</dd> :
                                    <dd style={{fontSize: 20}}>{InputGroup.username}</dd>
                                }
                            </dl>
                            <Divider/>
                            <dl>
                                <dt>タイトル:</dt>
                                <dd>{InputGroup.title}</dd>
                            </dl>
                            <Divider/>
                            {InputGroup.description !== "" && 
                                <dl>
                                    <dt>詳細:</dt>
                                    <dd>{InputGroup.description}</dd>
                                </dl>
                            }
                            <Divider/>
                            <div className={styles["participant-card-container"]}>
                                {InputGroup.participants.map((participant, index) => (
                                    <ParticipantCard key={index} participant={participant} index={index}/>
                                ))}
                            </div>
                        </div>
                        
                        <Button disabled={!canSubmit} className={styles["submit-button"]} onClick={handleInitSubmit} >送信</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatSettingPage;

const ParticipantCard: React.FC<{participant: PersonDescription, index: number}> = ({participant,index}) => {

    return (
        <Card style={{backgroundColor:"#F8F8F8"}}>
            <CardContent>
                <p style={{fontSize: 12, marginBottom:5}}>{index+1}人目</p>
                <p style={{fontSize: 12, marginBottom: 2}}>名前:</p>
                {participant.name === "" ? 
                    <p style={{fontSize: 16, color: "red", marginBottom: 5}}>未設定</p> : 
                    <p style={{fontSize: 16, marginBottom: 5}}>{participant.name}</p>
                }
                <p style={{fontSize: 12, marginBottom: 2}}>性格:</p>
                {participant.persona === "" ? 
                    <p style={{color: "red",fontSize: 12}}>未設定</p> : 
                    <p style={{fontSize: 12}}>{participant.persona}</p>
                }
            </CardContent>
        </Card>
    )
}


