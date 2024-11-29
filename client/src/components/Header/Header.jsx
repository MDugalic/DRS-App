import React from "react";
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav } from "react-bootstrap";
import { FaHome, FaSearch, FaBell, FaEnvelope } from 'react-icons/fa';

export const Header = () => {

    return(
        <Navbar bg="light" className="p-3">
        <Navbar.Brand href="#home">My App</Navbar.Brand>
        <Nav className="ml-auto">
          <Nav.Link href="#home">
            <FaHome /> {/* Home icon */}
          </Nav.Link>
          <Nav.Link href="#search">
            <FaSearch /> {/* Search icon */}
          </Nav.Link>
          <Nav.Link href="#notifications">
            <FaBell /> {/* Notifications icon */}
          </Nav.Link>
          <Nav.Link href="#messages">
            <FaEnvelope /> {/* Messages icon */}
          </Nav.Link>
        </Nav>
      </Navbar>
    );
}