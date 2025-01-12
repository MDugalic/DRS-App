import React, { useState, useRef } from "react"; // Ensure useState and useEffect are imported
import { Button } from "react-bootstrap";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import './styles.css';


export const DisplayPost = ({username, text, image_path, created_at}) => {
    const [isLiked, setIsLiked] = useState(false);
    const heartIconRef = useRef(null);

    const handleLikeClick = () => {
        setIsLiked(prevState => !prevState);
    }

    // Helper function to format the created_at date
    const formatDate = (createdAt) => {
    const date = new Date(createdAt);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

    return (
        <div className="post-container">
            <div className="post-created-at">{formatDate(created_at)}</div>
                <p className="post-username">{username}</p>
            <div className="post-form">
            <div className="bg-dark text-light post-text" style={{ overflow: "hidden", resize: "none", border: "0px" }}>
                {text}
            </div>
                <div>
                    {/* Image Preview */}
                    <div>
                        {image_path && (
                            <div className="image-preview">
                                <img 
                                    src={`http://localhost:5000/posts/${image_path.replace(/\\/g, '/')}`} 
                                    alt="Selected" 
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="post-footer d-flex justify-content-end">
                <div className="hover-animation">
                    <Button
                            type="button" 
                            onClick={handleLikeClick} 
                            className="like-button"
                            variant="link"
                        >
                            <div 
                                ref={heartIconRef} 
                                style={{ cursor: 'pointer' }}>
                                    {isLiked ? ( 
                                        <IoMdHeart size={24} className="text-light" /> // Render filled heart if liked
                                    ) : (
                                        <IoMdHeartEmpty size={24} className="text-light" /> // Render empty heart if not liked
                                    )}
                            </div>
                    </Button>
                </div>
            </div>
        </div>
    );
}
