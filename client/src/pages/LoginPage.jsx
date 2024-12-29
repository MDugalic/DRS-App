import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import './styles.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

export const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    
    // Redirect if the user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        console.log(token)
        if (token) {
            navigate("/");  // Redirect to home if the user is already logged in
        }
    }, [navigate]);

    const handleLogin = async (event) => {
        event.preventDefault();
        
        // Clear any old tokens (like from Google)
        localStorage.removeItem('access_token');  // or sessionStorage.removeItem('access_token');

        const loginData = { username, password };

        try {
            const response = await axios.post('/login', loginData);

            // Assuming backend returns only your project's token
            if (response.data && response.data.access_token) {
                // Store the new token
                localStorage.setItem('access_token', response.data.access_token);

                // Proceed with login success actions
                console.log("Login successful, token:", response.data.access_token);
                navigate("/"); 
            }
        } catch (error) {
            console.error("Error sending login data:", error);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Form className="form-page-layout" onSubmit={handleLogin}>
            <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                    type="text"
                    name="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}/>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}/>
            </Form.Group>

            <Button variant="primary" type="submit">
                Sign in
            </Button>
        </Form>
        </div>

    );
}
