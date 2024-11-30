import React, { useState, useRef } from "react"; // Ensure useState and useEffect are imported
import { Button } from "react-bootstrap";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import './styles.css';


export const DisplayPost = ({text, image_path}) => {
    const [isLiked, setIsLiked] = useState(false);
    const heartIconRef = useRef(null);

    const handleLikeClick = () => {
        setIsLiked(prevState => !prevState);
    }

    return (
        <div className="post-container">
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
                                    src={image_path} 
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
