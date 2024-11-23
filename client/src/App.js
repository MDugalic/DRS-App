import React, {useState, useEffect} from 'react'
import { CreateUserPage } from './pages/CreateUserPage';
import 'bootstrap/dist/css/bootstrap.min.css';

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
      <CreateUserPage/>
    </div>
  );
  
}

export default App