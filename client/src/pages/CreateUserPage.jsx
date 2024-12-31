import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './styles.css';
import axios from 'axios';
import { Header } from '../components/Header/Header'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const CreateUserPage = () => {
  const initialFormData = {
    first_name: '',
    last_name: '',
    address: '',
    city: '',
    country: '',
    phone_number: '',
    email: '',
    username: '',
    password: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const isValidInput = (name, value) => {
    const noNumberFields = ["city", "first_name", "last_name", "country"];
    if (noNumberFields.includes(name) && /\d/.test(value)) {
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Block client form typing numbers in certain fields
    /*if (!isValidInput(name, value)) {
      return;
    }*/

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateFields = () => {
    const newErrors = {};
    const requiredFields = ["first_name", "last_name", "email", "username", "password"];
    Object.keys(formData).forEach((key) => {
      if (requiredFields.includes(key) && !formData[key].trim()) {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')} is required`;
      }
    });
    return newErrors;
  };

  const register = async (event) => {
    event.preventDefault();
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // Stop submission if there are validation errors
    }

    setErrors({}); // Clear errors if validation passes
    console.log(formData);

    // send to API
    try {
      const response = await axios.post('/register', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      toast.success(`Successfully registered ${formData.username}`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark", // Matches your dark theme
      });
      console.log('User registered successfully:', response.data);
      // Redirect, show success message, or clear the form here
      setFormData(initialFormData);
    } catch (error) {
      console.error('There was an error registering the user:', error);
      if (error.response) {
        // If the server responds with a status code outside the 2xx range
        console.error('Error response:', error.response);
        setErrors({ server: 'An error occurred while registering the user. Please try again later.' });
      } else {
        // If the error is not related to the server (e.g., network error)
        setErrors({ server: 'Network error. Please check your connection.' });
      }
    }
  };

  return (
    <><Header></Header>
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div>
        <h1 className="text-center mb-4">Register a new user</h1>
        <Form className="form-page-layout" onSubmit={register}>
          {/* First Name and Last Name */}
          <Row className="mb-3">
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="first_name">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  isInvalid={!!errors.first_name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.first_name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="last_name">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  isInvalid={!!errors.last_name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.last_name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Address */}
          <Form.Group className="mb-3" controlId="address">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              isInvalid={!!errors.address}
            />
            <Form.Control.Feedback type="invalid">
              {errors.address}
            </Form.Control.Feedback>
          </Form.Group>

          {/* City */}
          <Form.Group className="mb-3" controlId="city">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              isInvalid={!!errors.city}
            />
            <Form.Control.Feedback type="invalid">
              {errors.city}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Country */}
          <Form.Group className="mb-3" controlId="country">
            <Form.Label>Country</Form.Label>
            <Form.Control
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              isInvalid={!!errors.country}
            />
            <Form.Control.Feedback type="invalid">
              {errors.country}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Phone Number */}
          <Form.Group className="mb-3" controlId="phone_number">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              isInvalid={!!errors.phone_number}
            />
            <Form.Control.Feedback type="invalid">
              {errors.phone_number}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Email */}
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Username */}
          <Form.Group className="mb-3" controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              isInvalid={!!errors.username}
            />
            <Form.Control.Feedback type="invalid">
              {errors.username}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Server Error */}
          {errors.server && (
            <div className="alert alert-danger">
              {errors.server}
            </div>
          )}

          <Button className="d-flex mx-auto" variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </div>
    </div>
    <ToastContainer />
    </>
  );
};
