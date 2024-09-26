import React, { Component } from 'react';
import { getFirestore, doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebase'; // Assuming you've configured Firebase auth
import './index.css';

class PostPopup extends Component {
  state = {
    content: '',
    files: [], // State to store the selected files (images and videos)
    fileUrls: [], // Array for the uploaded file URLs
  };

  handleChange = (event) => {
    this.setState({ content: event.target.value });
  };

  handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length) {
      this.setState({ files: selectedFiles });
    }
  };

  // Function to send post content to the ML model for drug detection
  checkForDrugContent = async (content) => {
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji_sequence: content }), // Assuming emoji_sequence is checked for drugs
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error during prediction:", response.status, errorData);
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error}`);
      }

      const data = await response.json();
      return data.predicted_target === 1; // Return true if drug-related content is detected
    } catch (error) {
      console.error("Error during prediction:", error);
      return false;
    }
  };

  handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('User not logged in');
        return;
      }
  
      // Fetch additional user details from Firestore (username, profileImage)
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (!userDoc.exists()) {
        console.log('User details not found in Firestore');
        return;
      }
  
      const { username, profileImage } = userDoc.data();
  
      // Assume checkForDrugContent is your ML model or function that checks if the content is related to drugs
      const isDrugRelated = await this.checkForDrugContent(this.state.content);

  
      if (isDrugRelated) {
        // If content is related to drugs, save user details in a separate collection
        const userData = {
          username: username || 'Unknown User',
          email: user.email,
          profileImage: profileImage || '',
          content: this.state.content,
          createdAt: new Date(),
        };
  
        await addDoc(collection(db, 'drugRelatedPosts'), userData);
        
        console.log('Drug-related content. User details stored.');
        
        // Close the popup
        this.props.onClose();
        
        return; // Don't proceed with normal post submission
      }
  
      let fileUrls = [];
      if (this.state.files.length) {
        const storage = getStorage();
  
        // Upload each file (images and videos) to Firebase Storage
        const uploadPromises = this.state.files.map(async (file) => {
          const fileRef = ref(storage, `posts/${user.uid}/${file.name}`);
          
          // Upload file and wait for completion
          await uploadBytes(fileRef, file);
          
          // Get the file URL after upload
          const url = await getDownloadURL(fileRef);
          return url;
        });
  
        // Resolve all upload promises and store URLs
        fileUrls = await Promise.all(uploadPromises);
        console.log('Files uploaded successfully, URLs:', fileUrls);
      }
  
      // Create the post data
      const postData = {
        content: this.state.content,
        fileUrls: fileUrls, // Store array of file URLs (images and videos)
        email: user.email,
        username: username || 'Unknown User',
        profileImage: profileImage || '',
        createdAt: new Date(),
      };
      
      // Save post in the user's personal 'posts' collection
      await addDoc(collection(db, 'users', user.uid, 'posts'), postData);
  
      // Save the post in the 'publicPosts' collection with user details
      const docRef = await addDoc(collection(db, 'publicPosts'), postData);
  
      // Add the post to the home page by calling the addPost method (if provided)
      if (typeof this.props.addPost === 'function') {
        this.props.addPost({ ...postData, id: docRef.id });
      }
  
      console.log('Post added to publicPosts and user-specific posts collections');
  
      // Close the popup after submission
      this.props.onClose();
  
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };
  

  render() {
    return (
      <div className="overlay">
        <div className="post-popup">
          <form onSubmit={this.handleSubmit}>
            <textarea
              value={this.state.content}
              onChange={this.handleChange}
              placeholder="Write something..."
            />
            <input
              type="file"
              accept="image/*,video/*" // Accept both image and video files
              multiple // Allow multiple files to be selected
              onChange={this.handleFileChange}
            />
            <button type="submit">Post</button>
            <button type="button" onClick={this.props.onClose}>Cancel</button>
          </form>
        </div>
      </div>
    );
  }
}

export default PostPopup;
