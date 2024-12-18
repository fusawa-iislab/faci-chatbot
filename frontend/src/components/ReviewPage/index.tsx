import React, {useEffect, useState} from 'react';
import Plot from 'react-plotly.js';
import styles from './styles.module.css';

type ReviewPageProps = {

}

type ParticipantsReviewData = {
    name: string;
    word_count: number;
    speak_count: number;
}

type PlotData = {
    data: any[];
    layout: object;
}

const ReviewPage: React.FC<ReviewPageProps> = () => {
    const [PlotDatas, setPlotDatas] = useState<PlotData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const response=await fetch(`${process.env.REACT_APP_BACKEND_PATH}/api/review`)
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
                    name: 'Word Count'
                }],
                layout: { 
                    title: '文字数',
                    xaxis: {title: '名前'},
                    yaxis: {title: '文字数'},
                    autosize: true,
                }
            }

            const SpeakCountPlot: PlotData = {
                data: [{
                    x: Names,
                    y: SpeakCounts,
                    type: 'bar',
                    name: 'Speak Count'
                }],
                layout: { 
                    title: '発言回数',
                    xaxis: {title: '名前'},
                    yaxis: {title: '発言回数'},
                    autosize: true,
                }
            }

            setPlotDatas((prevPlotDatas)=>{
                return [...prevPlotDatas, WordCountPlot, SpeakCountPlot];
            })
        });
    }, []);

    return (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div className={styles["plot-area-container"]}>
                {PlotDatas.map((PlotData,index)=>
                    <div  key={index} className={styles["plot-area-item"]}>
                        <Plot data={PlotData.data} layout={PlotData.layout} style={{width: '100%'}}></Plot>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReviewPage;