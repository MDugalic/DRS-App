import React, {useEffect, useState} from "react";
import axios from 'axios';
import { CreatePost } from "../../components/CreatePost/CreatePost";
import './styles.css';
import { DisplayPost } from "../../components/DisplayPost/DisplayPost";
import { Header } from '../../components/Header/Header'



export const HomePage = () => {
    const [posts, setPosts] = useState([]);

    const handleLoadPost = async (event) => {
        try {

            const userId = 1; // Replace with the actual user ID you want to query
            const response = await axios.get(`/posts/get-friends?user_id=${userId}`);

            setPosts(response.data)
        } catch (error) {
            console.error("Error fetching friends' posts:", error);
        }
    }

    useEffect(() => {
        handleLoadPost();
    }, [])

    return(
        <><Header></Header>
    <div>
        <div className="general">
            <div className="create-post">
                <CreatePost/>
            </div>
            <div className="post-list">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <DisplayPost id={post.id} text={post.text} image_path={post.image_path}/>
                    ))
                ) : (
                    <p>No posts available</p>
                )}
            </div>
        </div>

    </div>
    </>
    )
}