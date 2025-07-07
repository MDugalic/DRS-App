import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header/Header';
import './styles.css';
import io from 'socket.io-client';
import { API_URL, urlPostsApprove, urlPostsDeny } from '../apiEndpoints';

const PostApprovalPage = () => {
    const [pendingPosts, setPendingPosts] = useState([]);

    useEffect(() => {
        const socket = io(API_URL, {
            transports: ['websocket'],
          });
        // Request the pending posts from the server
        socket.emit("get_pending_posts");

        // Listen for updates to pending posts
        socket.on("pending_posts_update", (posts) => {
            setPendingPosts(posts);
        });

        // Add a new post to the list
        socket.on("new_pending_post", (newPost) => {
            setPendingPosts((prevPosts) => [newPost, ...prevPosts]);
        });

        // Remove a post from the list when it is approved or denied
        socket.on("post_approved", (data) => {
            setPendingPosts((prevPosts) =>
                prevPosts.filter((post) => post.id !== data.id)
            );
        });

        socket.on("post_denied", (data) => {
            setPendingPosts((prevPosts) =>
                prevPosts.filter((post) => post.id !== data.id)
            );
        });

        // Cleanup WebSocket connection on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);

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

    const handleApprove = async (postId) => {
        // Update the post to mark it as "processing"
        setPendingPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId ? { ...post, processing: 'approve' } : post
            )
        );

        try {
            const response = await fetch(`${urlPostsApprove}/${postId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                setPendingPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId ? { ...post, processing: null } : post
                    )
                );
                console.log(`Post ${postId} approved successfully`);
            } else {
                const errorData = await response.json();
                console.error("Error approving post:", errorData.message);
                setPendingPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId ? { ...post, processing: null } : post
                    )
                );
            }
        } catch (error) {
            console.error("Error:", error);
            setPendingPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId ? { ...post, processing: null } : post
                )
            );
        }
    };

    const handleDeny = async (postId) => {
        // Update the post to mark it as "processing"
        setPendingPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId ? { ...post, processing: 'deny' } : post
            )
        );

        try {
            const response = await fetch(`${urlPostsDeny}/${postId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                setPendingPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId ? { ...post, processing: null } : post
                    )
                );
                console.log(`Post ${postId} denied successfully`);
            } else {
                const errorData = await response.json();
                console.error("Error denying post:", errorData.message);
                setPendingPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId ? { ...post, processing: null } : post
                    )
                );
            }
        } catch (error) {
            console.error("Error:", error);
            setPendingPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId ? { ...post, processing: null } : post
                )
            );
        }
    };

    return (
        <>
            <Header />
            <div className="post-approval-page">
                <h1 style={{ fontWeight: 'bold', fontSize: '36px', paddingLeft: '10px' }}>Pending Posts</h1>
                <br />
                {pendingPosts.length > 0 ? (
                    <div className="posts-list">
                        {pendingPosts.map((post) => (
                            <div key={post.id} className="post">
                                <div className="post-created-at">{formatDate(post.created_at)}</div>
                                <p className="post-username">{post.username}</p>
                                <p className="post-text">{post.text}</p>
                                {post.image_path && (<div className="image-preview"><img src={`${API_URL}/posts/${post.image_path.replace(/\\/g, '/')}`} alt="Post" /></div>)}
                                <div className="button-group">
                                    <button
                                        className="approve-button"
                                        onClick={() => handleApprove(post.id)}
                                        disabled={post.processing || post.processing === 'deny'} // Disable if processing or denied
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="deny-button"
                                        onClick={() => handleDeny(post.id)}
                                        disabled={post.processing || post.processing === 'approve'} // Disable if processing or approved
                                    >
                                        Deny
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{marginLeft: '10px'}}>No pending posts found.</p>
                )}
            </div>
        </>
    );
};

export default PostApprovalPage;
