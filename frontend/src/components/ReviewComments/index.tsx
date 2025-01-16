import React, {useEffect,useState} from 'react';
import styles from './styles.module.css';

import Silhoutte from '../../assets/images/person-silhouette.svg';
import { ReviewCommentDataProps } from "../ReviewPage"
type ReviewCommentsProps = {
    ReviewComments: ReviewCommentDataProps[];
};


const ReviewComments: React.FC<ReviewCommentsProps> = ({
    ReviewComments
}) => {

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
                            imagePath={commentData.imagePath}
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

const ReviewComment: React.FC<ReviewCommentDataProps> = ({
    name,
    comment,
    id,
    imagePath
}) => {
    return (
        <div className={styles["review-comment-wrapper"]}>
            <p className={styles["comment"]}>{comment}</p>
            <div className={styles["participant-info"]}>
                <img src={imagePath ? `${process.env.REACT_APP_BACKEND_PATH}${imagePath}` : Silhoutte} alt={`${name} image`} className={styles["participant-icon"]}/>
                <p>{name}</p>
            </div>
        </div>
    )
}

