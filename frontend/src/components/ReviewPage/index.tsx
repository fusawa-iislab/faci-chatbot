import React, {useEffect, useState} from 'react';
import styles from './styles.module.css';

import DataPlots from '../DataPlots';
import ChatLog from '../ChatLog';
import ReviewComments from '../ReviewComments';
import { ChatData } from '../../assets/CommonStructs';

type ReviewPageProps = {

}

type ReviewPageDatasProps = {
    chatdatas: ChatData[];
}




const ReviewPage: React.FC<ReviewPageProps> = () => {
    const [ReviewPageDatas, setReviewPageDatas] = useState<ReviewPageDatasProps>({chatdatas:[]});

    useEffect(() => {
        const fetchData = async () => {
            const response=await fetch(`${process.env.REACT_APP_BACKEND_PATH}/api/review-data`)
            const data: ReviewPageDatasProps = await response.json();
            return data
        };
        const ReviewData=fetchData();

        ReviewData.then((data)=>{
            setReviewPageDatas(data);
        });
    },[]);



    return (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center", marginTop:10, width: "100vw"}}> 
            <div className={styles["review-page"]}>
                <h1 style={{alignSelf:"flex-start"}}>Review Page</h1>
                <div style={{width:800, marginBottom:10} }>
                    <h3>Chat Log</h3>
                    <ChatLog chatdatas={ReviewPageDatas.chatdatas}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",width: "fit-content"}}>
                    <h3 style={{width: "100%", marginLeft: "auto"}}>Data Plots</h3>
                    <DataPlots/>
                </div>
                <div style={{width:800, marginTop:10}}>
                    <h3>Comments from participants</h3>
                    <ReviewComments/>
                </div>
            </div>
        </div>
    )
}

export default ReviewPage;