import React, { useRef, useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import addImageIcon from '../../assets/add_image_icon.png';
import trashIcon from '../../assets/trash_icon.png';
import "./styles.css";

export const CreatePost = () => {
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [postContent, setPostContent] = useState("");
    const [charCount, setCharCount] = useState(0);
    const postMaxLength = 200;

    const handleAddImageClick = () => {
        fileInputRef.current.click(); // Trigger file input
    };

    const handleRemoveImageClick = () => {
        setSelectedImage(null);
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
        if (textarea) { // check if element is correctly referenced
            setCharCount(event.target.value.length);
            setPostContent(event.target.value);
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent the form from reloading the page

        const formData = new FormData();
        formData.append("username", "johndoe123");
        formData.append("text", postContent);
        if (fileInputRef.current.files[0]) {
            formData.append("image", fileInputRef.current.files[0]);
        }

        try {
            const response = await fetch("/posts/create_post", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                alert("Error creating post");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <div className="create-post-form">
            <Form className="handleSubmit" onSubmit={handleSubmit}>
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
                    <div>
                        {/* Image Preview */}
                        <div>
                            {selectedImage && (
                                <div className="image-preview">
                                    <img 
                                        src={selectedImage} 
                                        alt="Selected" 
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="create-post-form-footer">
                    <OverlayTrigger
                        placement="bottom"
                        delay={{ show: 500, hide: 200 }}
                        overlay={<Tooltip>Add Image</Tooltip>}
                    >
                        <Button 
                            variant="outline-primary"
                            onClick={handleAddImageClick}
                        >
                            <img src={addImageIcon} 
                            style={{ maxWidth: "24px"}} 
                            alt="Add Image" />
                        </Button>
                    </OverlayTrigger>
                    <div>
                        {selectedImage && (
                            <OverlayTrigger
                                placement="bottom"
                                delay={{ show: 500, hide: 200 }}
                                overlay={<Tooltip>Remove Image</Tooltip>}
                            >
                                <Button 
                                    variant="outline-danger"
                                    onClick={handleRemoveImageClick}
                                >
                                    <img src={trashIcon} 
                                    style={{ maxWidth: "24px"}} 
                                    alt="Remove Image" />
                                </Button>
                            </OverlayTrigger>
                        )}
                    </div>
                    {/* Hidden file input */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />

                    <Button variant="primary" type="submit">Post</Button>
                </div>
            </Form>
        </div>
    );
};
