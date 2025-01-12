import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { HomePage } from './pages/HomePage/HomePage';
import { LoginPage } from './pages/LoginPage';
import { UpdateUserPage } from './pages/UpdateUserPage';
import { ProfilePage } from './pages/ProfilePage';
import { BlockListPage } from './pages/BlockListPage';
import { CreateUserPage } from './pages/CreateUserPage';
import { NotificationWindow } from './components/NotificationWindow/NotificationWindow';
import { FriendsListPage } from './pages/FriendsListPage/FriendsListPage';
import axios from 'axios';
import PostApprovalPage from './pages/PostApprovalPage';

// Dummy function to check if the user is authenticated
const isAuthenticated = () => {
  return localStorage.getItem("access_token") !== null;
};

// Function to fetch user data (including role)
const getUserRole = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const response = await axios.get('/get_current_user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.role; // Extract the role from the user data
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

// Protected Route for Authenticated Users
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Admin Route for Admin Users Only
const AdminRoute = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const role = await getUserRole();
      setUserRole(role);
      setLoading(false);
    };
    fetchRole();
  }, []);

  if (loading) return <div></div>;

  if (!isAuthenticated()) return <Navigate to="/login" />; // Not logged in
  if (userRole !== 'admin') return <Navigate to="/" />; // Not an admin

  return children;
};

// Router Configuration
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
  {
    path: "/register",
    element: (
      <AdminRoute>
        <CreateUserPage />
      </AdminRoute>
    ),
  },
  {
    path: "/post_list",
    element: (
      <AdminRoute>
        <PostApprovalPage />
      </AdminRoute>
    ),
  },
  {
    path: "/block_list",
    element: (
      <AdminRoute>
        <BlockListPage />
      </AdminRoute>
    ),
  },
  {
    path: "/notifications",
    element: (
      <NotificationWindow isVisible={true}/>
    )
  },
  {
    path: "/friends_list",
    element: (
      <ProtectedRoute>
        <FriendsListPage/>
      </ProtectedRoute>
    )
  }
]);

function App() {
  return (
    <div className="bg-dark text-light" style={{ minHeight: "100vh" }}>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;