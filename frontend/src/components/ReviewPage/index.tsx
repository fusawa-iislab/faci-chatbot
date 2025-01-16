import React, {useEffect, useState} from 'react';
import styles from './styles.module.css';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

import DataPlots from '../DataPlots';
import ChatLog from '../ChatLog';
import ReviewComments from '../ReviewComments';
import InfoList from '../InfoList';
import { ChatData, Person } from '../../assets/CommonStructs';

type ReviewPageProps = {

}

type ReviewPageDataProps = {
    chatdatas: ChatData[];
    title: string;
    description: string;
    participants: Person[];
}


export type ReviewCommentDataProps = {
    name: string;
    comment: string;
    id: number;
    imagePath: string|null;
}

export type PlotParticipantDataProps = {
    name: string;
    word_count: number;
    speak_count: number;
}

export type PlotDataProps = {
    data: any[];
    layout: object;
}

const PlotColors = ['lightcoral', 'lightskyblue', 'lightgreen', 'lightsalmon', 'plum', 'paleturquoise', 'orchid', 'khaki', 'lightpink', 'mediumaquamarine'];

type ReviewComponentsOptions = "log" | "plots" | "comments";

const ReviewPage: React.FC<ReviewPageProps> = () => {
    const [ShowDrawer, setShowDrawer] = useState<boolean>(false);
    const [ReviewPageData, setReviewPageData] = useState<ReviewPageDataProps>({chatdatas:[],title:"",description:"",participants:[]});
    const [reviewComments, setReviewComments] = useState<ReviewCommentDataProps[]>([]);
    const [PlotDatas, setPlotDatas] = useState<PlotDataProps[]>([]);
    const [SelectedComponent, setSelectedComponent] = useState<ReviewComponentsOptions>("log");

    useEffect(() => {
        const fetchData = async () => {
            const response=await fetch(`${process.env.REACT_APP_BACKEND_PATH}/api/review-data`)
            const data: ReviewPageDataProps = await response.json();
            return data
        };
        const ReviewData=fetchData();

        ReviewData.then((data)=>{
            setReviewPageData(data);
        });
    },[]);

    useEffect(() => {
        const fetchCommentData = async () => {
            const response=await fetch(`${process.env.REACT_APP_BACKEND_PATH}/api/review-comments`)
            const data: ReviewCommentDataProps[] = await response.json();
            return data
        };
        const ReviewData=fetchCommentData();

        ReviewData.then((data)=>{
            setReviewComments(data);
        });
    },[]);

    useEffect(() => {
        const fetchPlotData = async () => {
            const response=await fetch(`${process.env.REACT_APP_BACKEND_PATH}/api/review-plot`)
            const data: PlotParticipantDataProps[] = await response.json();
            return data
        };
        const ReviewData=fetchPlotData();

        ReviewData.then((data)=>{
            const Names:string[]= data.map((d)=>d.name);
            const WordCounts:number[]= data.map((d)=>d.word_count);
            const SpeakCounts:number[]= data.map((d)=>d.speak_count);
            
            const WordCountPlot : PlotDataProps = {
                data: [{
                    x: Names,
                    y: WordCounts,
                    type: 'bar',
                    name: 'Word Count',
                    marker: {
                        color: PlotColors.slice(0, Names.length),
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

            const SpeakCountPlot: PlotDataProps = {
                data: [{
                    x: Names,
                    y: SpeakCounts,
                    type: 'bar',
                    name: 'Speak Count',
                    marker: {
                        color: PlotColors.slice(0, Names.length),
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
        <div style={{display:"flex",flexDirection:"column",alignItems:"center", marginTop:10, width: "100vw"}}> 
            <div className={styles["review-page"]}>
                <div style={{width: "100%", display: "flex", justifyContent: "space-between"}}>
                    <h1 style={{alignSelf:"flex-start"}}>Review Page</h1>
                    <Button onClick={()=>{setShowDrawer(true)}}>
                        <MenuOpenIcon sx={{color: "gray"}}/>
                    </Button>
                </div>
                <div style={{display:"flex", justifyContent:"space-around", width: "100%", marginTop:1, maxWidth:600}}>
                    <Button onClick={()=>{setSelectedComponent("log")}}>Chat Log</Button>
                    <Button onClick={()=>{setSelectedComponent("plots")}}>Data Plots</Button>
                    <Button onClick={()=>{setSelectedComponent("comments")}}>Comments</Button>
                </div>
                {SelectedComponent==="log"&&
                    <div style={{width:800, marginBottom:10} }>
                        <h3>Chat Log</h3>
                        <ChatLog chatdatas={ReviewPageData.chatdatas} maxHeight={"70vh"}/>
                    </div>
                }
                {SelectedComponent==="plots"&&
                    <div style={{width:"fit-content", marginBottom:10}}>
                        <h3>Data Plots</h3>
                        <DataPlots PlotDatas={PlotDatas}/>
                    </div>
                }
                {SelectedComponent==="comments"&&
                    <div style={{width:800, marginBottom:10}}>
                        <h3>Comments from participants</h3>
                        <ReviewComments ReviewComments={reviewComments}/>
                    </div>
                }
            </div>
            <Drawer anchor="right" open={ShowDrawer} onClose={() => setShowDrawer(false)} sx={{'& .MuiDrawer-paper': {width: 300},}}>
                <InfoList title={ReviewPageData.title} description={ReviewPageData.description} participants={ReviewPageData.participants}/>
            </Drawer>
        </div>
    )
}

export default ReviewPage;