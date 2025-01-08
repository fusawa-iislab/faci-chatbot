import React, {useState, useEffect} from 'react';
import Plot from 'react-plotly.js';
import styles from './styles.module.css';

const Colors = ['lightcoral', 'lightskyblue', 'lightgreen', 'lightsalmon', 'plum', 'paleturquoise', 'orchid', 'khaki', 'lightpink', 'mediumaquamarine'];



type ParticipantsReviewData = {
    name: string;
    word_count: number;
    speak_count: number;
}

type PlotData = {
    data: any[];
    layout: object;
}

const DataPlots: React.FC = () => {
    const [PlotDatas, setPlotDatas] = useState<PlotData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const response=await fetch(`${process.env.REACT_APP_BACKEND_PATH}/api/review-plot`)
            const data: ParticipantsReviewData[] = await response.json();
            return data
        };
        const ReviewData=fetchData();

        ReviewData.then((data)=>{
            const Names:string[]= data.map((d)=>d.name);
            const WordCounts:number[]= data.map((d)=>d.word_count);
            const SpeakCounts:number[]= data.map((d)=>d.speak_count);
            
            const WordCountPlot : PlotData = {
                data: [{
                    x: Names,
                    y: WordCounts,
                    type: 'bar',
                    name: 'Word Count',
                    marker: {
                        color: Colors.slice(0, Names.length),
                    }
                }],
                layout: { 
                    title: '文字数',
                    xaxis: {title: '名前'},
                    yaxis: {title: '文字数'},
                    autosize: true,
                    responsive: true,
                }
            }

            const SpeakCountPlot: PlotData = {
                data: [{
                    x: Names,
                    y: SpeakCounts,
                    type: 'bar',
                    name: 'Speak Count',
                    marker: {
                        color: Colors.slice(0, Names.length),
                    }
                }],
                layout: { 
                    title: '発言回数',
                    xaxis: {title: '名前'},
                    yaxis: {title: '発言回数'},
                    autosize: true,
                    responsive: true,
                }
            }

            setPlotDatas([WordCountPlot, SpeakCountPlot]);
        })
    }, []);

    return (
        <div className={styles["plot-area-container"]}>
            {PlotDatas.map((PlotData,index)=>
                <div  key={index} className={styles["plot-area-item"]}>
                    <Plot data={PlotData.data} layout={PlotData.layout} style={{width: "100%", height: "100%"}}></Plot>
                </div>
            )}
        </div>
    );
}
 
export default DataPlots;