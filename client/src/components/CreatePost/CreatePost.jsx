/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useRef, useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import addImageIcon from '../../assets/add_image_icon_white.png';
import trashIcon from '../../assets/trash_icon_white.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./styles.css";


export const CreatePost = () => {
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [postContent, setPostContent] = useState("");
    const [charCount, setCharCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("text", postContent);
        if (fileInputRef.current.files[0]) {
            formData.append("image", fileInputRef.current.files[0]);
        }

        try {
            const response = await fetch("/posts/create", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: formData,
            });

            if (!response.ok) {
                toast.error("Error creating post", {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                });
            } else {
                toast.success("Post sent to admin review", {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                });
                setPostContent("");
                setCharCount(0);
                textareaRef.current.style.height = "auto";
                fileInputRef.current.value = '';
                setSelectedImage(null);
            }
        } catch (error) {
            toast.error("Network error. Please try again.", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false); // Re-enable button
        }
    };

    return (
        <div className="create-post-container">
            <Form className="handleSubmit" onSubmit={handleSubmit}>
                <div className="create-post-form">
                    <textarea
                        className="bg-dark text-light"
                        ref={textareaRef}
                        value={postContent}
                        placeholder="What's up?"
                        maxLength={postMaxLength}
                        style={{ overflow: "hidden", resize: "none", border: "0px" }} // Disable manual resizing
                        onInput={handleTextareaInput}
                    />
                    <div>
                        {/* TODO: Fix hr z-index. Currently hr is on top of everything*/}
                        <hr/>
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
                            variant="primary"
                            onClick={handleAddImageClick}
                        >
                            <img src={addImageIcon} 
                            style={{ maxWidth: "24px"}} 
                            alt="Add Image"/>
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
                                    variant="danger"
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

                   <Button 
                        variant="primary" 
                        type="submit"
                        disabled={isSubmitting || !postContent.trim()}
                    >
                        {isSubmitting ? 'Posting...' : 'Post'}
                    </Button>
                </div>
            </Form>
            <ToastContainer />
        </div>
    );
};
