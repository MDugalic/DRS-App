import React from "react";
import axios from "axios";
import './styles.css';
import { IoMdCheckmark } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import {urlFriendsAcceptRequest, urlFriendsRejectRequest} from '../../apiEndpoints';


export const SingleRequest = ({username, id, onUpdate}) => {

    // Function to accept the friend request
    const handleAccept = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return null;

        try {
            const response = await axios.post(
                `${urlFriendsAcceptRequest}/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json', // Optional but can be useful
                    }
                }
            );
            console.log('Friend request accepted:', response.data);
            onUpdate(id);   // Update parent component
        } catch (error) {
            console.log(error.response.data);
        }
    };

    // Function to decline the friend request
    const handleDecline = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return null;
        try {
            const response = await axios.post(
                `${urlFriendsRejectRequest}${id}`,
                {}, // This is the request body (empty if not needed)
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            console.log('Friend request rejected:', response.data);
            onUpdate(id); // Update parent component
        } catch (error) {
            console.log(error.response.data);
        }
    };

    return(
        <div className="request-container">
            <div className="username-container">
                <div>
                    <FaUser size={30} style={{padding:"3px"}}/>
                </div>
                <div className="username-itself">
                    {username}
                </div>
            </div>
            &nbsp;has sent a friend request
            <br/>
            <button className="button" onClick={handleAccept}>
                <IoMdCheckmark 
                    style={{marginBottom:"3px"}}
                    size={20} 
                    color="rgb(0, 204, 51)"
                    />
                Accept
            </button>
            <button className="button" onClick={handleDecline}>
                <IoMdClose 
                    style={{marginBottom:"3px"}}
                    size={20} 
                    color="red" 
                />
                Decline
            </button>
        </div>
    );

}