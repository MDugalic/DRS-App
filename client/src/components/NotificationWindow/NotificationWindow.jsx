import React, { useEffect, useState } from "react";
import axios from "axios";
import { SingleRequest } from "../SingleRequest/SingleRequest";
export const NotificationWindow = ({ isVisible }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch notifications only when the popup is visible
    if (isVisible) {
      const token = localStorage.getItem('access_token');
      axios
        .get("/friends/get_requests", {
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

  if (!isVisible) return null;

  return (
    <div className="notification-window">
      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications available.</p>
      ) : (
        <ul>
          {notifications.map((notification, index) => (
            <SingleRequest 
              username={notification.username}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
