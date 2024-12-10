import React,{useState} from 'react';
import styles from './styles.module.css'
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import Textarea from '@mui/joy/Textarea';
import Button from '@mui/material/Button';
import { PersonDescription,InputData } from '../ChatSettingPage';


type ParticipantsSettingParops = {
    InputGroup: InputData;
    setInputGroup: React.Dispatch<React.SetStateAction<InputData>>;
}



const ParticipantsSetting: React.FC<ParticipantsSettingParops> = ({InputGroup,setInputGroup}) => {
    const [Pindex,setPindex] = useState<number>(1);

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


    return (
        <div style={{display:"flex", flexDirection: "column", alignItems: "center" }}>
            <div className={styles["participant-setting-wrapper"]}>
                <div className={styles["participant-setting-inner"]}>
                    <p style={{fontWeight:"bold",fontSize:18}}>{Pindex}人目</p>
                    <div className={styles["input-group"]}>
                        <InputLabel htmlFor={`name-${Pindex}`}>名前:</InputLabel>
                        <Input type="text" value={InputGroup.participants[Pindex-1].name} onChange={(e) => handleParticipantChange(e,Pindex-1, "name")} placeholder="名前" id={`name-${Pindex}`}/>
                    </div>
                    <div className={`${styles["input-group"]} ${styles["column"]}`}>
                        <InputLabel htmlFor={`persona-${Pindex + 1}`}>人格:</InputLabel>
                        <Textarea value={InputGroup.participants[Pindex-1].persona} onChange={(e) => handleParticipantChange(e, Pindex-1, 'persona')} id={`persona-${Pindex}`} minRows={2}/>
                    </div>
                    <div>
                        <Button>デフォルトを使う</Button>
                    </div>
                </div>
            </div>
            <div className={styles["participant-scroll"]}>
                <Button onClick={() => setPindex(Pindex-1)} disabled={Pindex <= 1}>前の人</Button>
                <span>{Pindex}/{InputGroup.participants.length}</span>
                <Button onClick={() => setPindex(Pindex+1)} disabled={Pindex >= InputGroup.participants.length}>次の人</Button>
            </div>
        </div>
    )
}

export default ParticipantsSetting;













