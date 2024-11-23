import React from 'react';
import Silhoutte from '../../assets/images/person- silhouette.svg';
import styles from './styles.module.css';


export type ParticipantBotProps = {
    name?: string;
    persona?: string;
}

const ParticipantBot : React.FC<ParticipantBotProps> = ({
    name = "participant",
    persona = "",
}) =>{

    return (
        <div className={styles["participant-wrapper"]}>
            <div className={styles["comment-wrapper"]}></div>
            <img src={Silhoutte} className={styles["siloutte-image"]}/>
            <p className={styles["participant-name"]}>{name}</p>
        </div>
    );
};

export default ParticipantBot;
