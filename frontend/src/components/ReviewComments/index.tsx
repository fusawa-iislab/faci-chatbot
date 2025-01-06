import React, {useEffect,useState} from 'react';
import styles from './styles.module.css';

import Silhoutte from '../../assets/images/person- silhouette.svg';

type ReviewCommentsProps = {
};

type CommentDataProps = {
    name: string;
    comment: string;
    id: number;
}

const ReviewComments: React.FC<ReviewCommentsProps> = () => {
    const [ReviewComments, setReviewComments] = useState<CommentDataProps[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const response=await fetch(`${process.env.REACT_APP_BACKEND_PATH}/api/review-comments`)
            const data: CommentDataProps[] = await response.json();
            return data
        };
        const ReviewData=fetchData();

        ReviewData.then((data)=>{
            setReviewComments(data);
        });
    },[]);


    return (
        <div className={styles["outer-wrapper"]}>
            {ReviewComments && ReviewComments.length > 0 ? (
                <div className={styles["wrapper"]}>
                    {ReviewComments.map((commentData, index) => (
                        <ReviewComment
                            key={index}
                            name={commentData.name}
                            comment={commentData.comment}
                            id={commentData.id}
                        />
                    ))}
                </div>
            ) : (
                <p className={styles["loading"]}>Loading</p>
            )}
        </div>
    );
};

export default ReviewComments;

const ReviewComment: React.FC<CommentDataProps> = ({name,comment,id}) => {
    return (
        <div className={styles["review-comment-wrapper"]}>
            <p className={styles["comment"]}>{comment}</p>
            <div className={styles["participant-info"]}>
                <img src={Silhoutte} alt="person" className={styles["person-icon"]}/>
                <p>{name}</p>
            </div>
        </div>
    )
}

