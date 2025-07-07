export const API_URL = process.env.REACT_APP_API_URL || 'https://drs-backend-ahhh.onrender.com';

// login
export const urlLogin = `${API_URL}/login`;
export const urlLogout = `${API_URL}/logout`;

// profile
export const urlProfile = `${API_URL}/profile`;
export const urlGetCurrentUser = `${API_URL}/get_current_user`;
export const urlUpdateProfile = `${API_URL}/update_profile`;

// friends
export const urlFriendsSendRequest = `${API_URL}/friends/send_request`;
export const urlFriendsRequestStatus = `${API_URL}/friends/request_status`;
export const urlFriendsGetRequests = `${API_URL}/friends/get_requests`;
export const urlFriendsGetRequestCount = `${API_URL}/friends/get_request_count`;
export const urlFriendsAcceptRequest = `${API_URL}/friends/accept_request`;
export const urlFriendsRejectRequest = `${API_URL}/friends/reject_request`;
export const urlFriendsRemoveFriend = `${API_URL}/friends/remove_friend`;
export const urlFriendsIsFriend = `${API_URL}/friends/is_friend`;
export const urlFriendsGetAll = `${API_URL}/friends/get_all`;

// posts
export const urlPostsGetFriends = `${API_URL}/posts/get-friends`;
export const urlPostsCreate = `${API_URL}/posts/create`;


// admin
export const urlRegister = `${API_URL}/register`;
export const urlGetBlockList = `${API_URL}/get_block_list`;
export const urlUnblockUser = `${API_URL}/unblock_user`;

export const urlPostsApprove = `${API_URL}/posts/approve`;
export const urlPostsDeny = `${API_URL}/posts/deny`;

