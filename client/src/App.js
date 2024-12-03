import React from 'react';
import { createBrowserRouter, RouterProvider, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Header } from './components/Header/Header';
import { HomePage } from './pages/HomePage/HomePage';
import { LoginPage } from './pages/LoginPage';
import { UpdateUserPage } from './pages/UpdateUserPage';
import { ProfilePage } from './pages/ProfilePage';
import { CreatePost } from './components/CreatePost/CreatePost';
import { CreateUserPage } from './pages/CreateUserPage';

// Dummy function to check if the user is authenticated
const isAuthenticated = () => {
  return localStorage.getItem("access_token") !== null;  // Check if there's a valid token in localStorage
};

// Protected Route component to check authentication
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/profile/:username",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/update",
    element: (
      <ProtectedRoute>
        <UpdateUserPage />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <div className="bg-dark text-light" style={{ minHeight: "100vh" }}>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;