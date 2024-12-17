import React, {useEffect, useState} from 'react';
import Plot from 'react-plotly.js';

type ReviewPageProps = {

}

type ParticipantsReviewData = {
    name: string;
    word_count: number;
    speak_count: number;
}


const ReviewPage: React.FC<ReviewPageProps> = () => {
    const [PlotData, setPlotData] = useState<any[]>([]);

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
            
            const WordCountPlot = {
                x: Names,
                y: WordCounts,
                type: 'bar',
                name: 'Word Count'
            }

            const SpeakCountPlot = {
                x: Names,
                y: SpeakCounts,
                type: 'bar',
                name: 'Speak Count'
            }

            setPlotData((prevPlotData)=>{
                return [WordCountPlot,SpeakCountPlot]
            })
        });
    }, []);

    return (
        <div>
            <Plot data={PlotData} layout={{ title: 'Participants Review' }}></Plot>
        </div>
    )
}

export default ReviewPage;