import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';
import Devider from '@mui/material/Divider';

import {SituationTemplate,PersonTemplate } from "../ChatSettingPage";

type DefaultTemplatesProps ={
    situationsTemplates: SituationTemplate[];
    personsTemplates: PersonTemplate[];    
}

const DefaultTemplates: React.FC<DefaultTemplatesProps> = ({situationsTemplates,personsTemplates}) => {


    return ( 
        <div>

        </div>
    )
}

export default DefaultTemplates;

export const DefaultPersons: React.FC<PersonTemplate[]> = (persons) => {
    return (
        <div style={{display: "flex", flexDirection:"column"}}>
            {persons.map((person) => (
                <DefaultPerson {...person}/>
            ))}
        </div>
    )
}

export const DefaultPerson: React.FC<PersonTemplate> = (person) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const handleClick = () => {
        setIsOpen(!isOpen);
    }
    return (
        <div style={{width:"100%",display:"flex",flexDirection:"column"}}>
            <p  onClick={handleClick} style={{marginBottom:3}}>{person.title}</p>
            <Devider/>
            {isOpen && (
                <div style={{paddingLeft:10,}}>
                    <p>名前:{person.content.name}</p>
                    <p>背景:{person.content.background}</p>
                    <p>人格:{person.content.persona}</p>
                </div>)}
        </div>
    )
}
