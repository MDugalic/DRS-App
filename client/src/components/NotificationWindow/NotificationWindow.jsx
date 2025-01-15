import React, { useEffect, useState } from "react";
import axios from "axios";
import { SingleRequest } from "../SingleRequest/SingleRequest";
import './styles.css';
import {urlFriendsGetRequests} from '../../apiEndpoints';


export const NotificationWindow = ({ isVisible }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch notifications only when the popup is visible
    if (isVisible) {
      const token = localStorage.getItem('access_token');
      axios
        .get(urlFriendsGetRequests, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then((response) => {
          setNotifications(response.data);
          console.log(response)
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching friend requests:", error);
          setLoading(false);
        });
    }
  }, [isVisible]);

  const updateNotifications = (id) => {
    setNotifications((prevNotifications) => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="notification-window">
      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>&nbsp;No notifications yet.&nbsp;</p>
      ) : (
        <ul>
          {notifications.map((notification, index) => (
            <SingleRequest 
              key={notification.id}
              id={notification.id}
              username={notification.username}
              onUpdate={updateNotifications}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
