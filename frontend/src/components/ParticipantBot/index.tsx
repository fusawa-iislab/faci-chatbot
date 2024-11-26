import React from 'react';
import Silhoutte from '../../assets/images/person- silhouette.svg';
import styles from './styles.module.css';

import {Participant} from "../../assets/structs";



export type ParticipantBotProps = Participant & {
    comment?: string|null; 
}

const ParticipantBot : React.FC<ParticipantBotProps> = ({
    name = "participant",
    persona = "",
    background = "",
    comment = null,
}) =>{

    return (
        <div className={styles["participant-wrapper"]}>
            {comment && <p className={styles["comment"]}>{comment}</p>}
            <img src={Silhoutte} className={styles["siloutte-image"]}/>
            <p className={styles["participant-name"]}>{name}</p>
        </div>
    );
};

export default ParticipantBot;
