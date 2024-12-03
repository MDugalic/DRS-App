import React, { useEffect, useState } from "react";
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav } from "react-bootstrap";
import { FaHome, FaSearch, FaBell, FaUserPlus } from 'react-icons/fa';
import { CgProfile, CgLogOut } from "react-icons/cg";
import axios from "axios";

export const Header = () => {
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    axios
      .get("/get_current_user", {
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

  const handleLogout = () => {
    localStorage.removeItem("access_token"); // Clear token
  };

  return (
    <Navbar bg="dark" data-bs-theme="dark" className="p-3">
      <Navbar.Brand href="#home">My App</Navbar.Brand>
      <Nav className="ml-auto">
        <Nav.Link href="/">
          <FaHome />
        </Nav.Link>
        <Nav.Link href="#search">
          <FaSearch />
        </Nav.Link>
        <Nav.Link href="#notifications">
          <FaBell />
        </Nav.Link>
        <Nav.Link href={`/profile/${username}`}>
          <CgProfile />
        </Nav.Link>
        {role === "admin" && ( // Show only if the user is an admin
          <Nav.Link href="/register">
            <FaUserPlus />
          </Nav.Link>
        )}
        <Nav.Link href="/login" onClick={handleLogout}>
          <CgLogOut />
        </Nav.Link>
      </Nav>
    </Navbar>
  );
};