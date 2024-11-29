import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import { useParams } from 'react-router-dom'; // To capture the username from the URL
import './styles.css';  // Import the CSS file for styling
import Button from 'react-bootstrap/Button'; // Importing Button from react-bootstrap

const ProfilePage = () => {
  const username = 'qwer';  // Hardcoded username for now
  // const { username } = useParams();  // Uncomment when routing is set up

  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);  // Defaulting to an empty array
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');  // Assuming the token is stored in localStorage after login

    if (!token) {
      console.error('No token found, unable to fetch user data');
      return;
    }

    axios.get(`/profile/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,  // Add JWT token to the request headers
      },
    })
    .then(response => {
      const { user, posts, is_current_user } = response.data;
      setUserData(user);

      // Check if posts is an array, if not set it to an empty array
      if (Array.isArray(posts)) {
        setPosts(posts);  // If posts is an array, set it as is
      } else {
        setPosts([]);  // If it's not an array (including if it's a string like "User has made no posts."), set it as an empty array
      }

      setIsCurrentUser(is_current_user);
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
    });
  }, [username]);

  const handleAddFriend = () => {
    // Add friend logic (e.g., send a POST request to add friend)
    axios.post(`/add_friend/${userData.id}`)
    .then(response => {
      if (response.data) {
        console.log(response.data);
      }
    }) 

  };

  if (!userData) return <div>Loading...</div>;  // Wait until the user data is loaded

  return (
    <div className="profile-page">
      <div className="user-info">
        <h1 style={{ fontWeight: 'bold', fontSize: '32px' }}>{userData.username}</h1>
        <p><strong>First Name:</strong> {userData.first_name}</p>
        <p><strong>Last Name:</strong> {userData.last_name}</p>
        <p><strong>Address:</strong> {userData.address}</p>
        <p><strong>City:</strong> {userData.city}</p>
        <p><strong>Country:</strong> {userData.country}</p>
        <p><strong>Phone:</strong> {userData.phone_number}</p>
        <p><strong>Email:</strong> {userData.email}</p>

        {!isCurrentUser && (
          <Button id="add-friend-btn" variant="primary" onClick={handleAddFriend}>Add Friend</Button>  // Primary button style
        )}
      </div>

      <hr />  {/* Added horizontal line between user info and posts */}

      <div className="posts-section">
        <h1 style={{ fontWeight: 'bold', fontSize: '36px' }}>Posts</h1>

        {posts.length === 0 ? (
          <p style={{ color: 'grey' }}>User hasn't made any posts yet.</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post">
              <p>{post.text}</p>
              {post.image_path && <img src={post.image_path} alt="Post" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export { ProfilePage };