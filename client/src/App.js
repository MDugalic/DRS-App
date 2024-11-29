import { CreateUserPage } from './pages/CreateUserPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LoginPage } from './pages/LoginPage';
import { UpdateUserPage } from './pages/UpdateUserPage';
import { CreatePost } from './components/CreatePost/CreatePost';
import { ProfilePage } from './pages/ProfilePage';
import { HomePage } from './pages/HomePage/HomePage';
import { Header } from './components/Header/Header';

function App() {

  // TODO
  // SETUP ROUTER

  return (
    <div className="bg-dark text-light" style={{minHeight: "100vh"}}>
      <Header/>
    </div>
  );
  
}

export default App