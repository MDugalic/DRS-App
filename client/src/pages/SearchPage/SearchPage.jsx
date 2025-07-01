import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import './styles.css';
import { Header } from '../../components/Header/Header'

export const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery) return; // Don't search if empty
        
        setHasSearched(true);
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

    // Handle Enter key press
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <>
            <Header/>
            
            <div className="search-page">
                <h2>Search Users</h2>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Enter username or email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown} // Added keydown handler
                        style={{
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            marginRight: "10px"
                        }}
                    />
                    <button 
                        onClick={handleSearch} 
                        disabled={loading || !searchQuery}
                        style={{
                            borderRadius: "4px",
                            border: "none",
                            backgroundColor: "#0d6efd",
                            color: "white",
                            cursor: "pointer"
                        }}
                    >
                        {loading ? "Searching..." : "Search"}
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
                        hasSearched && !loading && (
                            <div className="d-flex justify-content-center mt-4">
                                <p className="text-muted">No results found.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </>
    );
};