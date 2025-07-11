import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import './styles.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { urlLogin } from "../apiEndpoints";

export const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");  //CHANGE HERE: State for error message
    const navigate = useNavigate();
    
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('message') === 'account_blocked') {
            setErrorMessage("Your account is blocked. Please contact support.");
        }

        const token = localStorage.getItem('access_token');
        if (token) {
            navigate("/");  // Redirect to home if the user is already logged in
        }
    }, [navigate]);

    const handleLogin = async (event) => {
        event.preventDefault();
        
        localStorage.removeItem('access_token');  // or sessionStorage.removeItem('access_token');

        const loginData = { username, password };

        try {
            const response = await axios.post(urlLogin, loginData);

            if (response.data && response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                navigate("/"); 
            }
        } catch (error) {
            if (error.response && error.response.data) {
                //CHANGE HERE: Handle error if user is blocked
                if (error.response.data.message === "Account is blocked.") {
                    setErrorMessage("Your account is blocked. Please contact support.");
                } else {
                    setErrorMessage("Invalid username or password.");
                }
            } else {
                setErrorMessage("An error occurred. Please try again later.");
            }
            console.error("Error sending login data:", error.response.data);
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

                {errorMessage && (  //CHANGE HERE: Display error message if exists
                    <div className="alert alert-danger mt-3" role="alert">
                        {errorMessage}
                    </div>
                )}
            </Form>
        </div>
    );
}
