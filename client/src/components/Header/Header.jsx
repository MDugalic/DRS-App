import React from "react";
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav } from "react-bootstrap";
import { FaHome, FaSearch, FaBell } from 'react-icons/fa';
import { CgProfile } from "react-icons/cg";

export const Header = () => {

    return(
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
          <Nav.Link href="/profile">
            <CgProfile />
          </Nav.Link>
        </Nav>
      </Navbar>
    );
}