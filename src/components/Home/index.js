import React, { Component } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, query, orderBy, limit, collectionGroup } from 'firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import PostPopup from '../Popup';
import ProfileCard from '../ProfileCard';
import './index.css';
import { getAuth } from 'firebase/auth';

class Home extends Component {
  state = {
    posts: [],
    showPopup: false,
    currentUser: null,
    view: 'publicPosts',
    following: {},
    savedPosts: {},
    comments: {}, // Store all comments per postId
    newComment: {}, // Store new comment inputs
    showAllComments: {}, // Track which comments are shown
    postComments: [],
    isDrugContentDetected: false, // State for drug content detection
  };

  async componentDidMount() {
    await this.fetchPosts();
    await this.fetchAllComments();
    this.getCurrentUser();
  }

  handleDrugContentDetected = (isDetected) => {
    this.setState({ isDrugContentDetected: isDetected });
  };

  fetchAllComments = async () => {
    try {
      const commentsRef = collectionGroup(db, 'comments');
      const commentsSnapshot = await getDocs(commentsRef);

      const allComments = {};
      commentsSnapshot.forEach((doc) => {
        const comment = doc.data();
        const postId = doc.ref.parent.parent.id;
        if (!allComments[postId]) {
          allComments[postId] = [];
        }
        allComments[postId].push({ id: doc.id, ...comment });
      });

      this.setState({ comments: allComments });
    } catch (error) {
      console.error('Error fetching comments: ', error);
    }
  };

  fetchPosts = async () => {
    const { view, currentUser, isDrugContentDetected } = this.state;
    let collectionRef;

    // Check if drug content is detected
    if (isDrugContentDetected) {
      // Do not fetch posts if drug-related content is detected
      return;
    }

    // Fetch posts based on view
    if (view === 'publicPosts') {
      collectionRef = collection(db, 'publicPosts');
    } else if (view === 'savedPosts' && currentUser) {
      collectionRef = collection(db, 'users', currentUser.uid, 'savedPosts');
    } else if (view === 'projects' && currentUser) {
      collectionRef = collection(db, 'users', currentUser.uid, 'posts');
    } else {
      return;
    }

    const postSnapshot = await getDocs(collectionRef);
    const posts = postSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    this.setState({ posts });
  };

  getCurrentUser = () => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            this.setState({
              currentUser: {
                ...user,
                username: userData?.username || 'Anonymous',
              },
            });
          } else {
            console.log('No user document found in Firestore');
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
        }
      } else {
        this.setState({ currentUser: null });
      }
    });
  };

  render() {
    const { posts, following, savedPosts, currentUser, comments, newComment, showAllComments, isDrugContentDetected } = this.state;

    return (
      <div className='home-container'>
        <Navbar onDrugDetection={this.handleDrugContentDetected} />
        <Sidebar onNavigate={this.handleNavigation} />
        <div className='content-area'>
          <div className='feed-container'>
            {/* Only show posts if drug-related content is not detected */}
            {!isDrugContentDetected ? (
              posts.length > 0 ? posts.map((post) => (
                <div key={post.id} className="post_card">
                  <div className="post-header">
                    <img src={post.profileImage || 'default-profile.png'} alt="Profile" className="profile-image" />
                    <div className="post-user-info">
                      <h4>{post.username || 'Unknown User'}</h4>
                      <p>{post.email}</p>
                    </div>
                    <button
                      onClick={() => this.toggleFollow(post)}
                      className="follow-button"
                    >
                      {following[post.email] ? 'Unfollow' : 'Follow'}
                    </button>
                  </div>
                  <div className="post-content">
                    {post.imageUrls && post.imageUrls.length > 0 && (
                      <div className="post-images">
                        {post.imageUrls.map((imageUrl, imgIndex) => (
                          <img key={imgIndex} src={imageUrl} alt={`Post ${imgIndex}`} className="post-image" />
                        ))}
                      </div>
                    )}
                    <p>{post.content}</p>
                  </div>
                  <div className="post-footer">
                    <p>Posted on: {new Date(post.createdAt.seconds * 1000).toLocaleDateString()}</p>
                    <button 
                      onClick={() => this.savePost(post)} 
                      className="save-button"
                    >
                      {savedPosts[post.id] ? 'Saved' : 'Save'}
                    </button>
                  </div>

                  {/* Add Comment Button */}
                  <button 
                    className="comment-btn"
                    onClick={() => this.toggleShowAllComments(post.id)}
                  >
                    {showAllComments[post.id] ? 'Hide Comments' : 'Show Comments'}
                  </button>

                  {
                    showAllComments[post.id] && (
                      <div className='comments'>
                        {/* Input to add new comment */}
                        <div className="add-comment">
                          <input
                            type="text"
                            value={newComment[post.id] || ''}
                            onChange={(e) => this.handleCommentChange(post.id, e.target.value)}
                            placeholder="Add a comment..."
                          />
                          <button onClick={() => this.addComment(post.id)}>Post</button>
                        </div>
                      </div>
                    )
                  }

                </div>
              )) : <p>No posts available</p>
            ) : (
              <p>Posts hidden due to drug-related content detection.</p>
            )}
          </div>

          {currentUser && <ProfileCard user={currentUser} />}
        </div>
      </div>
    );
  }
}

export default Home;
