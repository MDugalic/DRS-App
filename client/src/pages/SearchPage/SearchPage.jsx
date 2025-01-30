import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import './styles.css';

export const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async () => {
        setLoading(true);
        setError("");
        setResults([]);

        try {
            const token = localStorage.getItem("access_token");
            const response = await axios.get(`/search_users`, {
                params: { query: searchQuery },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setResults(response.data);
        } catch (err) {
            console.error("Error during search:", err);
            setError("Failed to fetch search results. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="search-page">
            <h2>Search Users</h2>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Enter username or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearch} disabled={loading || !searchQuery}>
                    Search
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}
            
            <div className="results">
                {results.length > 0 ? (
                    results.map((user) => (
                        <div key={user.id} className="result-item">
                            <p>
                                <Link to={`/profile/${user.username}`}>
                                    {user.first_name} {user.last_name}
                                </Link>
                            </p>
                        </div>
                    ))
                ) : (
                    !loading && <p>No results found.</p>
                )}
            </div>
        </div>
    );
};
