import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import { Header } from '../components/Header/Header'
import './styles.css';

const BlockListPage = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch blocked users on component mount
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error('No token found');
          return;
        }
        const response = await axios.get('/get_block_list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBlockedUsers(response.data.blocked_users);
      } catch (error) {
        console.error('Error fetching blocked users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedUsers();
  }, []);

  // Unblock a user
  const unblockUser = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No token found');
        return;
      }
      await axios.post(`/unblock_user/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBlockedUsers((prev) => prev.filter((user) => user.id !== userId)); // Remove from the list
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header />
      <div className="blocklist-page">
        <h1 style={{ paddingLeft: '10px' }}>Blocked Users</h1>
        {blockedUsers.length === 0 ? (
          <p style={{paddingLeft: '10px'}}>No users are currently blocked.</p>
        ) : (
          blockedUsers.map((user) => (
            <div key={user.id} className="blocked-user">
              <div>
                <strong>{user.username}</strong>
                <div style={{ fontStyle: 'italic' }}>
                  {user.first_name} {user.last_name}
                </div>
              </div>
              <Button
                className='unblock-button'
                variant="danger"
                onClick={() => unblockUser(user.id)}
              >
                Unblock
              </Button>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export { BlockListPage };
