import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import './styles.css';
import axios from 'axios';

export const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    
    const handleLogin = async (event) => {
        event.preventDefault();
        const loginData = { username, password };

        try {
            const response = await axios.post('/login', loginData);
            console.log(response.data);
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
