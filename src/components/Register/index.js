import React, { useState } from 'react';
import { auth, db, storage } from '../firebase'; // Ensure correct import paths
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore'; // Firestore functions
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Firebase Storage functions
import { useNavigate } from 'react-router-dom';
import './index.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (!profileImage) {
      setImageError('Please upload a profile image.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Registered user:', user);

      // Upload profile image to Firebase Storage
      const imageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(imageRef, profileImage);
      const profileImageUrl = await getDownloadURL(imageRef);

      // Store user details (username, email, profile image) in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: email,
        profileImage: profileImageUrl,
        createdAt: new Date(), // Additional fields if needed
      });

      // Navigate to home page after successful registration
      navigate('/');

    } catch (error) {
      setError(error.message);
      console.log('Error:', error.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) { // Check if image is less than 2MB
      setProfileImage(file);
      setImageError('');
    } else {
      setImageError('File is too large. Maximum size is 2MB.');
    }
  };

  return (
    <div className="register-container">
      <h2>Register for Momentia</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleRegister}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
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
        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Profile Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {imageError && <p className="error">{imageError}</p>}
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
