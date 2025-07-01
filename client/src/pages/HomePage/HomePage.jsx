import React, {useEffect, useState} from "react";
import axios from 'axios';
import { CreatePost } from "../../components/CreatePost/CreatePost";
import './styles.css';
import { DisplayPost } from "../../components/DisplayPost/DisplayPost";
import { Header } from '../../components/Header/Header'
import {urlPostsGetFriends} from '../../apiEndpoints';


export const HomePage = () => {
    const token = localStorage.getItem('access_token');
    const [posts, setPosts] = useState([]);

    const handleLoadPost = async () => {
        try {
            const response = await axios.get(urlPostsGetFriends, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPosts(response.data);
        } catch (error) {
            console.error("Error fetching friends' posts:", error);
        }
    }

    useEffect(() => {
        handleLoadPost();
    }, []);

    return(
        <>
            <Header/>
            <div>
                <div className="general">
                    <div className="create-post">
                        <CreatePost/>
                    </div>
                    <div className="post-list">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <DisplayPost id={post.id} username={post.username} text={post.text} image_path={post.image_path} created_at={post.created_at}/>
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