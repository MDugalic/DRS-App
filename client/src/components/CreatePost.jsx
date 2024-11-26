import React, { useRef, useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import addImageIcon from '../assets/add_image_icon.png';
import "./CreatePost.css"

export const CreatePost = () => {
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const [charCount, setCharCount] = useState(0);
    const postMaxLength = 200;

    const handleAddImageClick = () => {
        fileInputRef.current.click(); // Trigger file input
    };

    const handleImageChange = (event) => {
        if (event.target && event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedImage(URL.createObjectURL(file)); // Create a preview URL for the image
        } else {
            console.error("File input not found or no file selected");
        }
    };

    const handleTextareaInput = (event) => {
        const textarea = textareaRef.current;
        if (textarea) {     // check if element is correctly referenced
            setCharCount(event.target.value.length)
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }

    return(
        <div className="create-post-form">
            <textarea
                ref={textareaRef}
                placeholder="What's up?"
                maxLength={postMaxLength}
                style={{ overflow: "hidden", resize: "none" }} // Disable manual resizing
                onInput={handleTextareaInput}
            />
            <div>
                {postMaxLength - charCount} characters remaining
            </div>

            <Form className="create-post-form">
                <div className="create-post-form-footer">
                    <OverlayTrigger
                        placement="bottom"
                        overlay={<Tooltip>Add Image</Tooltip>}>
                        
                        <Button 
                            variant="outline-primary"
                            onClick={handleAddImageClick}
                        >
                            <img src={addImageIcon} 
                            style={{ maxWidth: "24px"}} 
                            alt="Add Image"></img>
                        </Button>
                    </OverlayTrigger>

                    {/* Hidden file input */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />

                    {/* Image Preview */}
                    {selectedImage && (
                        <div className="image-preview">
                            <img 
                                src={selectedImage} 
                                alt="Selected" 
                                style={{ maxWidth: '100px', marginTop: '10px' }} 
                            />
                        </div>
                    )}

                    <Button variant="primary">Post</Button>
                </div>
            </Form>
        </div>
    );
}