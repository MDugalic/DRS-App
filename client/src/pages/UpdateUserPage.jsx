import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './styles.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header/Header'
import {urlGetCurrentUser, urlUpdateProfile} from '../apiEndpoints';

export const UpdateUserPage = () => {
  const optionalFieldStyle = {
    fontStyle: 'italic',
    fontSize: '0.85rem',
    color: '#87929c'
  };

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    address: '',
    city: '',
    country: '',
    phone_number: '',
    email: '',
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(urlGetCurrentUser, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        setFormData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          address: response.data.address || '',
          city: response.data.city || '',
          country: response.data.country || '',
          phone_number: response.data.phone_number || '',
          email: response.data.email || '',
          username: response.data.username || '',
          password: response.data.password || '', 
        });

      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrors({ server: 'Failed to load user data. Please try again.' });
      }
    };

    fetchUserData();
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateFields = () => {
    const newErrors = {};
    const requiredFields = ["first_name", "last_name", "email", "username", "password"];
    
    // Validate required fields
    requiredFields.forEach((key) => {
      if (!formData[key]?.trim()) {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')} is required`;
      }
    });

    // Validate email format
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const updateProfile = async (event) => {
    event.preventDefault();
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      const response = await axios.put(urlUpdateProfile, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      console.log('Profile updated successfully:', response.data);
      navigate(`/profile/${formData.username}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response) {
        setErrors({ server: 'Username/Email already taken. Please try another.' });
      } else {
        setErrors({ server: 'Network error. Please check your connection.' });
      }
    }
  };

  return (
    <><Header></Header>
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div>
        <h1 className="text-center mb-4">Update your profile</h1>
        <Form className="form-page-layout" onSubmit={updateProfile}>
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
            <Form.Label>
              Address <span style={optionalFieldStyle}>(optional)</span>
            </Form.Label>
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
            <Form.Label>
              City <span style={optionalFieldStyle}>(optional)</span>
            </Form.Label>
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
            <Form.Label>
              Country <span style={optionalFieldStyle}>(optional)</span>
            </Form.Label>
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
            <Form.Label>
              Phone Number <span style={optionalFieldStyle}>(optional)</span>
            </Form.Label>
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
              autoComplete="new-password"
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
            Update
          </Button>
        </Form>
      </div>
    </div>
    </>
  );
};