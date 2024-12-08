import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';
import { PersonDescription } from '../ChatSettingPage';

type SituationData = {
    title: string;
    content: {title: string, description: string};
}

type PersonData = {
    title: string;
    content: PersonDescription;
}





const DefaultSetting : React.FC = () => {
    const [situations, setSituations] = useState<SituationData[]>([]);
    const [persons, setPersons] = useState<PersonData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_PATH}/api/load_templates`);
                const data = await response.json();
                setSituations(data.situation);
                setPersons(data.person);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        console.log(situations);
        console.log(persons);
    }, []);
    

    return ( 
        <div>

        </div>
    )
}

export default DefaultSetting;