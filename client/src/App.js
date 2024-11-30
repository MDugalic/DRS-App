import React from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Header } from './components/Header/Header';
import { HomePage } from './pages/HomePage/HomePage'
import { LoginPage } from './pages/LoginPage';
import { UpdateUserPage } from './pages/UpdateUserPage';
import { CreatePost } from './components/CreatePost/CreatePost';
import { ProfilePage } from './pages/ProfilePage';

const router = createBrowserRouter([
  {
    path:"/",
    element: <HomePage />,
  },
  {
    path:"/login",
    element: <LoginPage />,
  },
  {
    path:"/profile/:username",
    element: <ProfilePage />
  }
]);

function App() {
  return (
    <div className="bg-dark text-light" style={{ minHeight: "100vh" }}>
        <Header />
        <RouterProvider router={router} />
    </div>
  );
}

export default App