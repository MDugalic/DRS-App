import React from "react";
import './styles.css';
import { IoMdCheckmark } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { FaUser } from "react-icons/fa";


export const SingleRequest = ({username}) => {
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
            <div className="button">
                <IoMdCheckmark 
                    style={{marginBottom:"2px"}}
                    size={20} 
                    color="rgb(0, 204, 51)"
                    />
                Accept
            </div>
            <div className="button">
                <IoMdClose 
                    style={{marginBottom:"2px"}}
                    size={20} 
                    color="red" 
                />
                Decline
            </div>
        </div>
    );

}