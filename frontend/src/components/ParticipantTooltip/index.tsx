import React from 'react';
import styles from './styles.module.css';
import { Person } from '../../assets/CommonStructs';
import Tooltip from '@mui/material/Tooltip';

type ParticipantTooltipProps = {
    person: Person;
    children: React.ReactNode;
}

const TooltipContent: React.FC<{person: Person}> = ({person}) => {
    return (
        <div className={styles["tooltip-wrapper"]}>
            <p style={{fontSize:14}}>名前:{person.name}</p>
            <p style={{fontSize:11}}>性格:{person.persona}</p>
        </div>
    );
}

const ParticipantTooltip: React.FC<ParticipantTooltipProps> = ({person, children}) => {
    return (
        <Tooltip title={<TooltipContent person={person}/>} followCursor enterDelay={1000} leaveDelay={100}>
            <div>{children}</div>
        </Tooltip>
    );
};

export default ParticipantTooltip;

