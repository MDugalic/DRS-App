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
import { SearchPage } from './pages/SearchPage/SearchPage';
import axios from 'axios';
import PostApprovalPage from './pages/PostApprovalPage';
import {urlGetCurrentUser} from './apiEndpoints';
import { io } from 'socket.io-client';
import { API_URL } from './apiEndpoints';

const socket = io(API_URL, {
  withCredentials: true,
  autoConnect: false     
});

// Dummy function to check if the user is authenticated
const isAuthenticated = () => {
  return localStorage.getItem("access_token") !== null;
};

// Function to fetch user data (including role)
const getUserRole = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const response = await axios.get(urlGetCurrentUser, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Full user response:", response.data);
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
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        setAuthChecked(true);
        return;
      }

      try {
        const role = await getUserRole();
        setIsAdmin(role === 'admin');
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  if (!authChecked) return <div></div>;
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;

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
    path: "/profile/update",
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
  },
  {  path: "/search",
    element: (
      <ProtectedRoute>
        <SearchPage />
      </ProtectedRoute>
    ),
  }
]);

const getCurrentUserId = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.identity || payload.sub;
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
};

const initializeSocket = (userId) => {
  const socket = io(API_URL, {
    withCredentials: true,
    autoConnect: true
  });

  socket.on('connect', () => {
    socket.emit('join_user_room', { userId });
  });

  socket.on('force_logout', (data) => {
    console.log('Received force_logout event', data);
    localStorage.setItem('force_logout', Date.now());
    performLogout(data.reason);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

const performLogout = (reason = '') => {
  // Clear all auth tokens
  localStorage.removeItem('access_token');
  sessionStorage.removeItem('access_token');
  
  // Clear cookies if used
  document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  
  // Disconnect socket if exists
  if (socket) socket.disconnect();
  
  // Redirect with reason
  window.location.href = `/login?message=${encodeURIComponent(reason)}`;
};

function App() {
  const [, setSocket] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      const userId = getCurrentUserId();
      const sock = initializeSocket(userId);
      setSocket(sock);

      const handleStorageChange = (e) => {
        if (e.key === 'force_logout') {
          performLogout('session_ended_other_tab');
        }
      };
      window.addEventListener('storage', handleStorageChange);

      return () => {
        sock?.disconnect();
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  return (
    <div className="bg-dark text-light" style={{ minHeight: "100vh" }}>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;