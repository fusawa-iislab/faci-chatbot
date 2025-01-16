import React, {useState, useEffect} from 'react';
import Plot from 'react-plotly.js';
import styles from './styles.module.css';
import { PlotParticipantDataProps, PlotDataProps } from '../ReviewPage';

const Colors = ['lightcoral', 'lightskyblue', 'lightgreen', 'lightsalmon', 'plum', 'paleturquoise', 'orchid', 'khaki', 'lightpink', 'mediumaquamarine'];

type DataPlotsProps = {
    PlotDatas: PlotDataProps[];
}

const DataPlots: React.FC<DataPlotsProps> = ({
    PlotDatas
}) => {

    return (
        <div className={styles["plot-area-container"]}>
            {PlotDatas.map((PlotData,index)=>
                <div  key={index} className={styles["plot-area-item"]}>
                    <Plot data={PlotData.data} layout={PlotData.layout} style={{width: 400, height: 400}}></Plot>
                </div>
            )}
        </div>
    );
}
 
export default DataPlots;