import React, {useState, useEffect} from 'react'
import { CreateUserPage } from './pages/CreateUserPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LoginPage } from './pages/LoginPage';
import { UpdateUserPage } from './pages/UpdateUserPage';
import { CreatePost } from './components/CreatePost/CreatePost';
import { ProfilePage } from './pages/ProfilePage';

function App() {

  return (
    <div>
      {/* <CreateUserPage/> */}
      <LoginPage/>
      <CreateUserPage/>
      {/* <UpdateUserPage></UpdateUserPage> */}
      <ProfilePage></ProfilePage>
    </div>
  );
  
}

export default App