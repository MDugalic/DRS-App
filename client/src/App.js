import React, {useState, useEffect} from 'react'
import { CreateUserPage } from './pages/CreateUserPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LoginPage } from './pages/LoginPage';
import { UpdateUserPage } from './pages/UpdateUserPage';
import { CreatePost } from './components/CreatePost/CreatePost';
import { ProfilePage } from './pages/ProfilePage';

function App() {

  const [data, setData] = useState({ members: [] });

  /*useEffect(() => {
    fetch("/members").then(
      res => res.json()
    ).then( data => {
        setData(data)
        console.log(data)
      }
    )
  }, [])*/

  return (
    <div>
      {/* <CreateUserPage/> */}
      <LoginPage/>
      {/* <UpdateUserPage></UpdateUserPage> */}
      <ProfilePage></ProfilePage>
    </div>
  );
  
}

export default App