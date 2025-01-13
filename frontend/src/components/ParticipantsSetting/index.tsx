import React,{useEffect, useState} from 'react';
import styles from './styles.module.css'
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import Textarea from '@mui/joy/Textarea';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';

import {InputData } from '../ChatSettingPage';
import {PersonDescription, PersonTemplate} from "../../assets/CommonStructs";



type ParticipantsSettingParops = {
    InputGroup: InputData;
    setInputGroup: React.Dispatch<React.SetStateAction<InputData>>;
}



const ParticipantsSetting: React.FC<ParticipantsSettingParops> = ({InputGroup,setInputGroup}) => {

    const [PIndex,setPIndex] = useState<number>(0);
    const [OpenTemplate, setOpenTemplate] = useState<boolean>(false);
    const [SelectedDefaultPerson, setSelectedDefaultPerson] = useState<PersonTemplate|null>(null);
    const [PersonTemplates,setPersonTemplates] = useState<PersonTemplate[]>([]);

    useEffect(()=>{
        if (PersonTemplates.length === 0) {
            fetch(`${process.env.REACT_APP_BACKEND_PATH}/api/load-participantbot-templates`)
                .then(response => response.json())
                .then(data => {
                    setPersonTemplates(data);
                })
                .catch(error => console.error(error));
            }
    },[])
    

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

    

    const handleDefaultPersonChange = (PIndex:number,SelectedDefaultPerson:PersonTemplate|null) => {
        if (SelectedDefaultPerson !== null) {
            const defaultPerson = SelectedDefaultPerson;
            const updatedParticipants = InputGroup.participants.map((participant, i) => {
                if (i === PIndex) {
                    return { ...participant, ...defaultPerson.content.args };
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
                        <Textarea value={InputGroup.participants[PIndex].persona} onChange={(e) => handleParticipantChange(e, PIndex, 'persona')} id={`persona-${PIndex}`} minRows={2} maxRows={4} style={{marginBottom:10}}/>
                    </div>
                    <Button onClick={handleOpenTemplateClick} className={styles["open-default-button"]} id={`open-default-${PIndex}`} sx={{alignSelf: "flex-end"}}>テンプレートを使う</Button>
                </div>
            </div>
            <div className={styles["participant-scroll"]}>
                <Button onClick={() => {setPIndex(PIndex-1); setSelectedDefaultPerson(null)}} disabled={PIndex <= 0}>前の人</Button>
                <span>{PIndex+1}/{InputGroup.participants.length}</span>
                <Button onClick={() => {setPIndex(PIndex+1); setSelectedDefaultPerson(null)}} disabled={PIndex >= InputGroup.participants.length-1}>次の人</Button>
            </div>
            <Drawer anchor="right" open={OpenTemplate} onClose={() => setOpenTemplate(false)} sx={{'& .MuiDrawer-paper': {width: 300},}}>
                <DefaultPersonsSelector setSelectedDefaultPerson={setSelectedDefaultPerson} setOpenTemplate={setOpenTemplate} PersonTemplates={PersonTemplates}/>
            </Drawer>
        </div>
    )
}

export default ParticipantsSetting;

export const DefaultPersonsSelector: React.FC<{setSelectedDefaultPerson:React.Dispatch<React.SetStateAction<PersonTemplate | null>>,setOpenTemplate: React.Dispatch<React.SetStateAction<boolean>>, PersonTemplates: PersonTemplate[]}> = ({
    setSelectedDefaultPerson,
    setOpenTemplate,
    PersonTemplates
}) => {

    const SpecificPersonsTemplates = PersonTemplates.filter((person) => person.type === "specific");
    const NormalPersonsTemplates = PersonTemplates.filter((person) => person.type === "normal");

    return (
        <div className={styles["participant-selector-wrapper"]}>
            <h3>Specific</h3>
            <div className={styles["participant-selector-list"]}>
                {SpecificPersonsTemplates.map((person,i) => (
                    <div key={i} onClick={()=>{
                        setSelectedDefaultPerson(person);
                        setOpenTemplate(false);}}>
                        <DefaultPersonOption {...person} />
                    </div>
                ))}
            </div>

            <h3 style={{marginTop: 10}}>Normal</h3>
            <div className={styles["participant-selector-list"]}>
                {NormalPersonsTemplates.map((person,i) => (
                    <div key={i} onClick={()=>{
                        setSelectedDefaultPerson(person);
                        setOpenTemplate(false);}}>
                        <DefaultPersonOption {...person} />
                    </div>
                ))}
            </div>
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
