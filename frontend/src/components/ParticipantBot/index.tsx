import React from 'react';
import Silhoutte from '../../assets/images/person- silhouette.svg';
import styles from './styles.module.css';

import {Participant} from "../../assets/structs";



export type ParticipantBotProps = {
    p: Participant;
    comment?: string|null; 
}

const ParticipantBot : React.FC<ParticipantBotProps> = ({
    p,
    comment = null,
}) =>{

    return (
        <div className={styles["participant-wrapper"]}>
            {comment && 
                <p className={styles["comment"]}>{comment}</p>
            }
            <img src={Silhoutte} className={styles["siloutte-image"]}/>
            <p className={styles["participant-name"]}>{p.name}</p>
        </div>
    );
};

export default ParticipantBot;
