import React, { useEffect, useState, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav } from "react-bootstrap";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaHome, FaSearch, FaBell, FaUserPlus, FaCheckSquare, FaBan } from 'react-icons/fa';
import { CgLogOut } from "react-icons/cg";
import { HiUsers } from "react-icons/hi2";
import axios from "axios";
import './styles.css';
import { NotificationWindow } from "../NotificationWindow/NotificationWindow";
import {urlGetCurrentUser, urlFriendsGetRequestCount} from '../../apiEndpoints';


export const Header = () => {
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState("");
  const [showNotifications, setShowNotifications] = useState(false); // State to toggle notification window
  const [hasNotifications, setHasNotifications] = useState(false); // State to indicate notifications

  const notificationRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    axios
      .get(urlGetCurrentUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const { role, username } = response.data;
        setRole(role); // Store role (e.g., "admin" or "user")
        setUsername(username); // Store username for profile link
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  // Red badge for Notification icon
  // TODO(mby?): Add notifitaion count inside the badge 
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    axios
      .get(urlFriendsGetRequestCount, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((response) => {
        setHasNotifications(response.data.count > 0);
      })
      .catch((error) => {
        console.error("Error fetching notification count:", error);
      });
  }, []);

  
  const handleLogout = () => {
    localStorage.removeItem("access_token"); // Clear token
  };

  const toggleNotifications = (event) => {
    event.stopPropagation();
    setShowNotifications((prev) => !prev); // Toggle the visibility state
  };

  // Close the notification window when clicking outside, on empty space
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
  
    if (showNotifications) {
      document.addEventListener("click", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showNotifications]);
  
  return (
    <div style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}>
      <Navbar bg="dark" data-bs-theme="dark" className="p-3">
        <Navbar.Brand href="/">Drs App</Navbar.Brand>
        <Nav className="ml-auto">

        <OverlayTrigger placement="bottom" overlay={<Tooltip>Home</Tooltip>}>
          <Nav.Link href="/">
            <FaHome />
          </Nav.Link>
        </OverlayTrigger>

        <OverlayTrigger placement="bottom" overlay={<Tooltip>Search</Tooltip>}>
          <Nav.Link href="/search">
            <FaSearch />
          </Nav.Link>
        </OverlayTrigger>

        <OverlayTrigger placement="bottom" overlay={<Tooltip>Notifications</Tooltip>}>
          <Nav.Link onClick={toggleNotifications}>
            <FaBell />
            {hasNotifications && <span className="notifications-badge"></span>}
          </Nav.Link>
        </OverlayTrigger>

        <OverlayTrigger placement="bottom" overlay={<Tooltip>Friends List</Tooltip>}>
          <Nav.Link href="/friends_list">
            <HiUsers />
          </Nav.Link>
        </OverlayTrigger>

          {role === "admin" && (
            <OverlayTrigger placement="bottom" overlay={<Tooltip>Register New User</Tooltip>}>
              <Nav.Link href="/register">
                <FaUserPlus />
              </Nav.Link>
            </OverlayTrigger>
          )}

          {role === "admin" && (
            <OverlayTrigger placement="bottom" overlay={<Tooltip>Approve Posts</Tooltip>}>
              <Nav.Link href="/post_list">
                <FaCheckSquare />
              </Nav.Link>
            </OverlayTrigger>
          )}

          {role === "admin" && (
            <OverlayTrigger placement="bottom" overlay={<Tooltip>Block List</Tooltip>}>
              <Nav.Link href="/block_list">
                <FaBan />
              </Nav.Link>
            </OverlayTrigger>
          )}
        </Nav>
        
        <Nav className="ms-auto">
          <OverlayTrigger placement="bottom" overlay={<Tooltip>Log out</Tooltip>}>
            <Nav.Link href="/login" onClick={handleLogout}>
              <CgLogOut />
            </Nav.Link>
          </OverlayTrigger>

          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>View your profile</Tooltip>}
          >
            <Nav.Link className="text-light" href={`/profile/${username}`}>
              {username}
            </Nav.Link>
          </OverlayTrigger>
        </Nav>
      </Navbar>

      {/* Render the NotificationWindow */}
      {showNotifications && (
      <div ref={notificationRef}>
        <NotificationWindow isVisible={showNotifications} />
      </div>
)}

    </div>
  );
};
