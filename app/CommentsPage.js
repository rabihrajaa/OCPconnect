import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getFirestore, doc, getDoc, collection, addDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore'; // Added updateDoc
import { useNavigation } from '@react-navigation/native';
import CommentList from '../components/CommentList';
import Header from '../components/Header';

const db = getFirestore();

export default function CommentPage() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState(''); // State for the new comment
  const [replyingTo, setReplyingTo] = useState(null); // State for the comment being replied to
  const navigation = useNavigation();
  const announcementId = 'OaxvNpOGCSrZkdcdA0P3'; // Adjust to your document ID

  const handleGoBack = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  // Fetch comments from Firestore
  const fetchComments = () => {
    const commentsRef = collection(db, 'annonces', announcementId, 'comments'); // Reference to the comments sub-collection

    // Use onSnapshot to listen for changes in real-time
    onSnapshot(commentsRef, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id, // Use Firestore document ID as the comment ID
        ...doc.data(),
      }));
      setComments(fetchedComments);
    });
  };

  useEffect(() => {
    fetchComments();
  }, []); // Fetch comments when the component mounts

  // Function to handle comment deletion
  const handleDeleteComment = (commentId) => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const commentRef = doc(db, 'annonces', announcementId, 'comments', commentId);
              await deleteDoc(commentRef); // Delete the comment document
            } catch (error) {
              console.error('Error deleting comment:', error);
            }
          }
        },
      ],
      { cancelable: true }
    );
  };

  // Function to handle replying to a comment
  const handleReplyToComment = (commentId, userName) => {
    setReplyingTo({ commentId, userName }); // Set the state with the comment ID and username being replied to
  };

  // Function to cancel replying to a comment
  const handleCancelReply = () => {
    setReplyingTo(null); // Reset the replying state
  };

  // Function to add a new comment or reply
  const handleAddComment = async () => {
    if (newComment.trim() === '') {
      Alert.alert('Comment cannot be empty!');
      return;
    }

    const commentData = {
      userName: 'YourUsername', // Replace with actual username
      profileImage: 'https://path-to-profile-image.jpg', // Replace with actual profile image URL
      time: new Date().toISOString(), // Replace with actual time
      text: newComment,
      replies: [],
    };

    try {
      const commentsRef = collection(db, 'annonces', announcementId, 'comments');
      if (replyingTo) {
        // If replying to a comment, add the reply to the appropriate comment's replies array
        const commentDocRef = doc(db, 'annonces', announcementId, 'comments', replyingTo.commentId);
        const commentSnapshot = await getDoc(commentDocRef);
        const commentData = commentSnapshot.data();

        // Check if the current comment already has replies
        const updatedReplies = [...commentData.replies, {
          userName: 'YourUsername', // Replace with actual username
          text: newComment,
          time: new Date().toISOString(),
          replies: [], // Initialize replies for the new reply
        }];

        // Update the comment's replies
        await updateDoc(commentDocRef, { replies: updatedReplies });
        
        setReplyingTo(null); // Reset the replying state
      } else {
        // Add new comment as a document
        await addDoc(commentsRef, commentData);
      }

      setNewComment(''); // Clear the input field after submission
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Header onGoBack={handleGoBack} content="Comments"/>

      {/* Use the CommentList component to display the comments */}
      <CommentList 
        comments={comments} 
        onDelete={handleDeleteComment} 
        onReply={handleReplyToComment} 
      />

      {/* If replying to a comment, show the reply info */}
      {replyingTo && (
        <View style={styles.replyInfo}>
          <Text>Replying to {replyingTo.userName}</Text>
          <TouchableOpacity onPress={handleCancelReply}>
            <FontAwesome name="times" size={20} color="red" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.addComment}>
        <TextInput 
          style={styles.input} 
          placeholder="Add a comment..."
          value={newComment} 
          onChangeText={setNewComment} // Update state with input
        />
        <TouchableOpacity onPress={handleAddComment}>
          <FontAwesome name="gift" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  replyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#e0e0e0',
  },
  addComment: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    marginRight: 10,
  },
});
