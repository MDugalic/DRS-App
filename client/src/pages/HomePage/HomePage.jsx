import React, {useEffect, useState} from "react";
import axios from 'axios';
import { CreatePost } from "../../components/CreatePost/CreatePost";
import './styles.css';
import { DisplayPost } from "../../components/DisplayPost/DisplayPost";
import { Header } from '../../components/Header/Header'
import { urlGetCurrentUser, urlPostsGetFriends} from '../../apiEndpoints';


export const HomePage = () => {
    const token = localStorage.getItem('access_token');
    const [posts, setPosts] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(urlPostsGetFriends, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                let currentUserId;
                try {
                    const decoded = decodeJwt(token);
                    currentUserId = decoded.sub;
                } catch (e) {
                    console.log("JWT decode failed, falling back to API");
                }

                if (!currentUserId) {
                    const userResponse = await axios.get(urlGetCurrentUser, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    currentUserId = userResponse.data.id;
                }

                const filteredPosts = response.data.filter(post => 
                    post.user_id?.toString() !== currentUserId?.toString()
                );

                setPosts(filteredPosts);
            } catch (error) {
                console.error("Error loading posts:", error);
            }
        };

        fetchPosts();
    }, [token, refreshTrigger]);

    function decodeJwt(token) {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(payloadJson);
    }

    const handleFriendRequestUpdate = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return(
        <>
            <Header onFriendRequestUpdate={handleFriendRequestUpdate}/>
            <div>
                <div className="general">
                    <div className="create-post">
                        <CreatePost onPostCreated={() => setRefreshTrigger(prev => prev + 1)}/>
                    </div>
                    <div className="post-list">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <DisplayPost 
                                    key={post.id}
                                    id={post.id}
                                    username={post.username}
                                    text={post.text}
                                    image_path={post.image_path}
                                    created_at={post.created_at}
                                />
                             ))
                        ) : (
                            <p className="text-center pt-3">No posts available</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}