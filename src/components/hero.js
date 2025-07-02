import React, { useState, useEffect } from "react";

// fetch API data

// Component names should be PascalCase
function Hero() { // Changed from hero to Hero
    // Correct useState destructuring
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true); // Optional: for loading state
    const [error, setError] = useState(null);     // Optional: for error handling

    useEffect(() => {
        // Define an async function inside useEffect to use await
        const fetchUsers = async () => {
            try {
                // Replace with your actual API endpoint
                const response = await fetch('https://jsonplaceholder.typicode.com/users');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setUsers(data);
            } catch (e) {
                setError(e.message);
                console.error("Failed to fetch users:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []); // Empty dependency array means this effect runs once after the initial render

    if (loading) return <p>Loading users...</p>;
    if (error) return <p>Error loading users: {error}</p>;

    return (
        <div>
            <h2>Hero Section - Users List</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id}>{user.name} - {user.email}</li>
                ))}
            </ul>
        </div>
    );
}

export default Hero; // Export the corrected component name