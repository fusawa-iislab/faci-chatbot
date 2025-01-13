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




const ReviewPage: React.FC<ReviewPageProps> = () => {
    const [ShowDrawer, setShowDrawer] = useState<boolean>(false);
    const [ReviewPageData, setReviewPageData] = useState<ReviewPageDataProps>({chatdatas:[],title:"",description:"",participants:[]});

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



    return (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center", marginTop:10, width: "100vw"}}> 
            <div className={styles["review-page"]}>
                <div style={{width: "100%", display: "flex", justifyContent: "space-between"}}>
                    <h1 style={{alignSelf:"flex-start"}}>Review Page</h1>
                    <Button onClick={()=>{setShowDrawer(true)}}>
                        <MenuOpenIcon sx={{color: "gray"}}/>
                    </Button>
                </div>
                <div style={{width:800, marginBottom:10} }>
                    <h3>Chat Log</h3>
                    <ChatLog chatdatas={ReviewPageData.chatdatas}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",width: "fit-content"}}>
                    <h3 style={{width: "100%", marginLeft: "auto"}}>Data Plots</h3>
                    <DataPlots/>
                </div>
                <div style={{width:800, marginTop:10, marginBottom: 10}}>
                    <h3>Comments from participants</h3>
                    <ReviewComments/>
                </div>
            </div>
            <Drawer anchor="right" open={ShowDrawer} onClose={() => setShowDrawer(false)} sx={{'& .MuiDrawer-paper': {width: 300},}}>
                <InfoList title={ReviewPageData.title} description={ReviewPageData.description} participants={ReviewPageData.participants}/>
            </Drawer>
        </div>
    )
}

export default ReviewPage;