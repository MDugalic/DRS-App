import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import './styles.css';

export const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        
    }

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Form className="form-page-layout">
            <Form.Group className="mb-3">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}/>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}/>
            </Form.Group>

            <Button variant="primary" type="submit" onChange={login}>
                Sign in
            </Button>
        </Form>
        </div>

    );
}
