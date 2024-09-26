import React, { useState } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa'; // Importing the search icon and add post icon
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of withRouter
import PostPopup from '../Popup';
import './index.css';

const Navbar = ({ onDrugDetection }) => {
  const [showPostPopup, setShowPostPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Search term state
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('User logged out');
    // Perform any other logout operations (like Firebase auth sign out if needed)

    // Navigate to the login page after logout
    navigate('/login');
  };

  const togglePostPopup = () => {
    setShowPostPopup(!showPostPopup);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value); // Update search term as the user types
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();

    try {
      // Make a POST request to the Flask API
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji_sequence: searchTerm }),  // sending emoji sequence
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error during prediction:", response.status, errorData);
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error}`);
      }

      const data = await response.json();
      console.log(data);
      if (data.predicted_target === 1) {
        alert("Warning: Drug-related content detected!");
        // Trigger the Home component to hide posts
        onDrugDetection(true);
        // Clear the search input if drug-related emojis are detected
        setSearchTerm('');
      } else {
        // If not drug-related, set drug detection to false and navigate to home
        onDrugDetection(false);
        navigate('/home');
      }
    } catch (error) {
      console.error("Error during prediction:", error);
    }
  };

  return (
    <nav className="navbar">
      <div>
        <form onSubmit={handleSearchSubmit} className='search_bar'>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={handleSearchChange} 
            className='search_input'
          />
          <button type="submit">
            <FaSearch />
          </button>
        </form>
      </div>

      <div className='actions'>
        <button onClick={togglePostPopup} className='add-post-btn'>
          <FaPlus />
        </button>
        {showPostPopup && <PostPopup onClose={togglePostPopup} />}
        <button className='logout-button' onClick={handleLogout}>Logout</button>
      </div>

    </nav>
  );
};

export default Navbar;
