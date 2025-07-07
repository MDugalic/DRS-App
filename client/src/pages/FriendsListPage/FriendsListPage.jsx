import React, { useEffect, useState } from 'react';
import './FriendsListPage.css';
import { Header } from '../../components/Header/Header';
import axios from 'axios';
import { FaUser } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import {urlFriendsGetAll} from '../../apiEndpoints';

export const FriendsListPage = () => {
    // Define state to hold the friends data
    const [friends, setFriends] = useState([]);

    const handleLoadFriends = async () => {
        try {
            const response = await axios.get(urlFriendsGetAll, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            setFriends(response.data);
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    };

    useEffect(() => {
        handleLoadFriends();
    }, []);

    return (
        <div>
            <Header />
            <div className="friends-list-main-container">
                <div className="friends-list">
                    <h1>Friends List</h1>
                    <br />
                    {/* Render the friends list */}
                    <ul>
                        {friends.map(friend => (
                            <div className="friend-container" 
                                key={friend.id}
                                onClick={() => window.location.href = `/profile/${friend.username}`}
                                onMouseEnter={(e) => e.target.style.cursor = "pointer"}
                            >
                                <FaUser 
                                    size={26}
                                    style={{paddingBottom:"3px"}}
                                />
                                &nbsp;
                                &nbsp;
                                &nbsp;
                                {friend.username}
                                <FaArrowRight

                                    size={26}
                                    style={{float:"right", paddingTop:"3px"}}
                                />
                            </div>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
