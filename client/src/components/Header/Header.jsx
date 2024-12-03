import React, { useEffect, useState } from "react";
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav } from "react-bootstrap";
import { FaHome, FaSearch, FaBell } from 'react-icons/fa';
import { CgProfile, CgLogOut } from "react-icons/cg";
import axios from "axios";

export const Header = () => {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    // Fetch current user data from the server
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.error("No token found. Cannot fetch user data.");
      return;
    }

    axios
      .get("/get_current_user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUsername(response.data.username); // Set the username from the response
      })
      .catch((error) => {
        console.error("Error fetching current user:", error);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token"); // Remove the token from localStorage
  };

  return (
    <Navbar bg="dark" data-bs-theme="dark" className="p-3">
      <Navbar.Brand href="#home">My App</Navbar.Brand>
      <Nav className="ml-auto">
        <Nav.Link href="/">
          <FaHome />
        </Nav.Link>
        <Nav.Link href="#search">
          <FaSearch /> {/* Search icon */}
        </Nav.Link>
        <Nav.Link href="#notifications">
          <FaBell /> {/* Notifications icon */}
        </Nav.Link>
        {username && (
          <Nav.Link href={`/profile/${username}`}>
            <CgProfile />
          </Nav.Link>
        )}
        <Nav.Link href="/login" onClick={handleLogout}>
          <CgLogOut />
        </Nav.Link>
      </Nav>
    </Navbar>
  );
};