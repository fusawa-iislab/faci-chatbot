import React,{useEffect, useState} from 'react';
import styles from './styles.module.css'
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import Textarea from '@mui/joy/Textarea';
import Button from '@mui/material/Button';
import Popper from '@mui/material/Popper';
import Divider from '@mui/material/Divider';

import {InputData } from '../ChatSettingPage';
import {PersonDescription, PersonTemplate} from "../../assets/CommonStructs";
import { PersonTemplates } from '../../assets/TemplateData';


type ParticipantsSettingParops = {
    InputGroup: InputData;
    setInputGroup: React.Dispatch<React.SetStateAction<InputData>>;
}



const ParticipantsSetting: React.FC<ParticipantsSettingParops> = ({InputGroup,setInputGroup}) => {

    const [PIndex,setPIndex] = useState<number>(0);
    const [OpenTemplate, setOpenTemplate] = useState<boolean>(false);
    const [SelectedDefaultPerson, setSelectedDefaultPerson] = useState<number|null>(null);
    

    const handleOpenTemplateClick = (e:React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setOpenTemplate(!OpenTemplate);
    }

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

    

    const handleDefaultPersonChange = (PIndex:number,SelectedDefaultPerson:number|null) => {
        if (SelectedDefaultPerson !== null) {
            const defaultPerson = PersonTemplates[SelectedDefaultPerson];
            const updatedParticipants = InputGroup.participants.map((participant, i) => {
                if (i === PIndex) {
                    return { ...participant, ...defaultPerson.content };
                }
                return participant;
            });
            setInputGroup(prevState => ({ ...prevState, participants: updatedParticipants }));
        }
    }

    useEffect(()=>{
        handleDefaultPersonChange(PIndex,SelectedDefaultPerson);
        },[SelectedDefaultPerson])


    return (
        <div style={{display:"flex", flexDirection: "column", alignItems: "center" }}>
            <div className={styles["participant-setting-wrapper"]}>
                <div className={styles["participant-setting-inner"]}>
                    <p style={{fontWeight:"bold",fontSize:18}}>{PIndex+1}人目</p>
                    <div className={styles["input-group"]}>
                        <InputLabel htmlFor={`name-${PIndex}`}>名前:</InputLabel>
                        <Input type="text" value={InputGroup.participants[PIndex].name} onChange={(e) => handleParticipantChange(e,PIndex, "name")} placeholder="名前" id={`name-${PIndex}`}/>
                    </div>
                    <div className={`${styles["input-group"]} ${styles["column"]}`}>
                        <InputLabel htmlFor={`persona-${PIndex}`}>性格:</InputLabel>
                        <Textarea value={InputGroup.participants[PIndex].persona} onChange={(e) => handleParticipantChange(e, PIndex, 'persona')} id={`persona-${PIndex}`} minRows={2} style={{marginBottom:10}}/>
                    </div>
                    <div style={{display: "flex", flexDirection: "column", width: "100%", alignItems: "flex-end"}}>
                        <Button onClick={handleOpenTemplateClick} className={styles["open-default-button"]} id={`open-default-${PIndex}`}>テンプレートを使う</Button>
                        <Popper open={OpenTemplate} anchorEl={document.querySelector(`#open-default-${PIndex}`)}
                                placement={'bottom'} disablePortal={true} style={{zIndex:1}}>
                            <DefaultPersonsSelector setSelectedDefaultPerson={setSelectedDefaultPerson} setOpenTemplate={setOpenTemplate}/>
                        </Popper>
                    </div>
                </div>
            </div>
            <div className={styles["participant-scroll"]}>
                <Button onClick={() => {setPIndex(PIndex-1); setSelectedDefaultPerson(null)}} disabled={PIndex <= 0}>前の人</Button>
                <span>{PIndex+1}/{InputGroup.participants.length}</span>
                <Button onClick={() => {setPIndex(PIndex+1); setSelectedDefaultPerson(null)}} disabled={PIndex >= InputGroup.participants.length-1}>次の人</Button>
            </div>
        </div>
    )
}

export default ParticipantsSetting;

export const DefaultPersonsSelector: React.FC<{setSelectedDefaultPerson:React.Dispatch<React.SetStateAction<number | null>>,setOpenTemplate: React.Dispatch<React.SetStateAction<boolean>>}> = ({
    setSelectedDefaultPerson,
    setOpenTemplate
}) => {

    return (
        <div className={styles["participant-selector"]}>
            {PersonTemplates.map((person,i) => (
                <div onClick={()=>{
                    setSelectedDefaultPerson(i);
                    setOpenTemplate(false);
                }} key={i}>
                    <DefaultPersonOption {...person} />
                    <Divider/>
                </div>
            ))}
        </div>
    )
}

export const DefaultPersonOption: React.FC<PersonTemplate> = (person) => {
    return (
        <div style={{width:"100%",display:"flex",flexDirection:"column"}}>
            <p style={{ marginBottom: 3 }}>
                {person.title}
            </p>
        </div>
    )
}
