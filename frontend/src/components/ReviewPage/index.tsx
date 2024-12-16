import React, {useEffect} from 'react';

type ReviewPageProps = {

}

type ParticipantsReviewData = {
    name: string;
    word_count: number;
    speak_count: number;
}

const ReviewPage: React.FC<ReviewPageProps> = () => {

    useEffect(() => {
        const fetchData = async () => {
            const response=await fetch(`${process.env.REACT_APP_BACKEND_PATH}/api/review`)
            const data: ParticipantsReviewData[] = await response.json();
            console.log(data);
            return data
        };
        const ReviewData=fetchData();
    }, []);

    return (
        <div>

        </div>
    )
}

export default ReviewPage;