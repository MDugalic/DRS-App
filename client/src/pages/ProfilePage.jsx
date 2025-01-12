import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom'; // To capture the username from the URL
import './styles.css';  // Import the CSS file for styling
import Button from 'react-bootstrap/Button'; // Importing Button from react-bootstrap
import { FaPencilAlt } from 'react-icons/fa'; // Importing FontAwesome Pencil icon
import { Header } from '../components/Header/Header'

const ProfilePage = () => {
  const { username } = useParams();  // Capture the username from the URL

  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);  // Defaulting to an empty array
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isFriend, setIsFriend] = useState(false);  // Track friendship status
  const [requestStatus, setRequestStatus] = useState(null); // Track the status of the friend request
  const [loading, setLoading] = useState(true); // Track loading state

  // Load user data and posts
  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      console.error('No token found, unable to fetch user data');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user profile data
        const userResponse = await axios.get(`/profile/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { user, posts, is_current_user } = userResponse.data;
        setUserData(user);
        setPosts(Array.isArray(posts) ? posts : []); // Ensure posts is an array
        setIsCurrentUser(is_current_user);

        // Fetch friendship status
        const friendResponse = await axios.get(`/friends/is_friend/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsFriend(friendResponse.data.is_friend); // Update friendship status

        // Fetch friend request status
        const requestStatusResponse = await axios.get(`/friends/request_status/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRequestStatus(requestStatusResponse.data.status); // Set request status

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Set loading to false after all data has been fetched
      }
    };

    fetchData();
  }, [username]);

  const handleAddFriend = () => {
    // Add friend logic (e.g., send a POST request to add friend)
    axios.post(`/friends/send_request/${userData.id}`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
    .then(response => {
      if (response.data) {
        console.log(response.data);
        setIsFriend(true); // Update friendship status
        setRequestStatus('pending'); // Update request status
      }
    })
    .catch(error => {
      console.error('Error sending friend request:', error);
      console.log(error.response.data);
      if (error.response.data.message === 'Friend request already sent.') {
        setRequestStatus('pending');
      }
    });
  };

  const handleRemoveFriend = () => {
    // Remove friend logic (e.g., send a POST request to remove friend)
    axios.post(`/friends/remove_friend/${userData.id}`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
    .then(response => {
      console.log(response.data);
      setIsFriend(false); // Update friendship status
      setRequestStatus(null);
    })
    .catch(error => {
      console.error('Error removing friend:', error);
    });
  };

  const renderRequestButton = () => {
    if (loading) {
      return <Button variant="secondary" disabled style={{height: "37.6px", width: "122.5px"}}></Button>;
    }
    
    if (requestStatus === 'pending') {
      return (
        <Button id="request-sent-btn" variant="secondary" disabled>
          Request Sent
        </Button>
      );
    } else if (isFriend) {
      return (
        <Button id="remove-friend-btn" variant="danger" onClick={handleRemoveFriend}>
          Remove From Friends
        </Button>
      );
    } else {
      return (
        <Button id="add-friend-btn" variant="success" onClick={handleAddFriend}>
          Send Friend Request
        </Button>
      );
    }
  };

  // Format the created_at date (dd/mm/yyyy hh:mm)
  const formatDate = (createdAt) => {
    const date = new Date(createdAt);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  if (!userData) return <div></div>;  // Wait until the user data is loaded

  return (
    <>
    <Header />
    <div className="profile-page">
      <div className="profile-header">
        <div className="user-info">
          <h1 style={{ fontWeight: 'bold', fontSize: '32px' }}>{userData.username}</h1>
          <p><strong>First Name:</strong> {userData.first_name}</p>
          <p><strong>Last Name:</strong> {userData.last_name}</p>
          <p><strong>Address:</strong> {userData.address}</p>
          <p><strong>City:</strong> {userData.city}</p>
          <p><strong>Country:</strong> {userData.country}</p>
          <p><strong>Phone:</strong> {userData.phone_number}</p>
          <p><strong>Email:</strong> {userData.email}</p>

          {!isCurrentUser && renderRequestButton()}
        </div>

        {/* Edit icon only shown if the logged-in user is viewing their own profile */}
        {isCurrentUser && (
          <div className="edit-icon">
            <Link to="/update" style={{ textDecoration: 'none' }}>
              <FaPencilAlt size={24} style={{ cursor: 'pointer', color: 'gray' }} />
            </Link>
          </div>
        )}
      </div>

      <hr />

      <div className="posts-section">
        <h1 style={{ fontWeight: 'bold', fontSize: '36px' }}>Posts</h1>
        <br />
        {posts.length === 0 ? (
          <p style={{ color: 'grey' }}>User hasn't made any posts yet.</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post">
              <div className="post-created-at">{formatDate(post.created_at)}</div>
              <p className="post-username">{post.username}</p>
              <p className="post-text">{post.text}</p>
              {post.image_path && (<div className="image-preview"><img src={`http://localhost:5000/posts/${post.image_path.replace(/\\/g, '/')}`} alt="Post" /></div>)}
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
};

export { ProfilePage };
