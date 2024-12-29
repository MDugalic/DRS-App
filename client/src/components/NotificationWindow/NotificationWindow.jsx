import React, { useEffect, useState } from "react";
import axios from "axios";

export const NotificationWindow = ({ isVisible }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch notifications only when the popup is visible
    if (isVisible) {
      axios
        .get("/get_requests") // Replace with your API endpoint
        .then((response) => {
          setNotifications(response.data);
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
            <li key={index}>{notification.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
