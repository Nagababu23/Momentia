import React, { useState } from 'react';
import { auth } from '../firebase'; // Correct path to firebase.js
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import './index.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate(); // Initialize navigate function

  const handleLogin = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('Logged in user:', user);
        // Show an alert message after successful login
        window.alert('Login successful! Welcome to Momentia.');
        // Navigate to home page or any other page after successful login
        navigate('/'); // Adjust the route as needed for your app
      })
      .catch((error) => {
        setError(error.message);
        console.log('Error:', error.message);
      });
  };

  return (
    <div className="login-container">
      <h2>Login to Momentia</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
