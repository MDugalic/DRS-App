import React from "react";
import { CreatePost } from "../../components/CreatePost/CreatePost";
import './styles.css';
export const HomePage = () => {


    return(
    <div>
        <div id="header" style={{height: "5vh", backgroundColor:"yellow"}}>
        </div>
        <div className="general">
            <div className="create-post">
                <CreatePost/>
            </div>
            <div className="post-list">

            </div>
        </div>

    </div>
    )
}