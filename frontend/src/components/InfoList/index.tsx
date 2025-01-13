import react, {useState} from 'react';
import styles from './styles.module.css';
import { List, ListItemText, ListItemButton, Collapse } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

import {Person} from '../../assets/CommonStructs';

type InfoListProps = {
    title: string;
    description?: string;
    participants: Person[];
}

const InfoList: React.FC<InfoListProps> = ({
    title,
    description="",
    participants,
}) => {
    const [participantOpen, setParticipantOpen] = useState<boolean>(false);

    const handleParticipantOpen = () => {
        setParticipantOpen(!participantOpen);
    }

    return (
        <List sx={{width:"100%",}}>
            <ListItemText 
                primary={title} 
                secondary={description.trim() ? description : undefined} 
                sx={{marginLeft: "0.5em"}}
            />
            <ListItemButton onClick={handleParticipantOpen}>
                <ListItemText primary="参加者"/>
                {participantOpen ? <ExpandLess/> : <ExpandMore/>}
            </ListItemButton>
            <Collapse in={participantOpen} timeout="auto" unmountOnExit sx={{ml:3}}>
                <List>
                    {participants.map((p,index) => (
                        <ListItemText primary={p.name} secondary={p.persona} key={index}/>
                    ))}
                </List>
            </Collapse>
        </List>
    )
}

export default InfoList;