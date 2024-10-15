import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getFirestore, doc, getDoc, collection, addDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import CommentList from '../components/CommentList';
import Header from '../components/Header';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../context/authContext';

const db = getFirestore();

export default function CommentPage() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // To store the comment you're replying to
  const navigation = useNavigation();

  const route = useRouter();
  const { announcementId } = useLocalSearchParams();
  console.log('Received announcementId:', announcementId);

  const { user } = useAuth();
  const userName = user ? user.username : 'Anonymous';
  const profileImage = user ? user.profileUrl : 'https://www.pngall.com/wp-content/uploads/5/User-Profile-Transparent.png';

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Fetch comments from Firestore
  const fetchComments = () => {
    const commentsRef = collection(db, 'annonces', announcementId, 'comments');
    onSnapshot(commentsRef, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(fetchedComments);
    });
  };

  useEffect(() => {
    fetchComments();
  }, []);

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
              await deleteDoc(commentRef);
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
  const handleReplyToComment = async (commentId) => {
    try {
      const commentDocRef = doc(db, 'annonces', announcementId, 'comments', commentId);
      const commentSnapshot = await getDoc(commentDocRef);
      if (commentSnapshot.exists()) {
        const commentData = commentSnapshot.data();
        setReplyingTo({ commentId, userName: commentData.userName }); // Store the comment's userName for reply
      }
    } catch (error) {
      console.error('Error fetching comment to reply to:', error);
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Function to add a new comment or reply
  const handleAddComment = async () => {
    if (newComment.trim() === '') {
      Alert.alert('Comment cannot be empty!');
      return;
    }

    try {
      const commentsRef = collection(db, 'annonces', announcementId, 'comments');
      if (replyingTo) {
        // Replying to a comment
        const commentDocRef = doc(db, 'annonces', announcementId, 'comments', replyingTo.commentId);
        const commentSnapshot = await getDoc(commentDocRef);
        const commentData = commentSnapshot.data();
        const updatedReplies = [...commentData.replies, {
          userName: userName,
          text: newComment,
          time: new Date().toISOString(),
        }];
        await updateDoc(commentDocRef, { replies: updatedReplies });
        setReplyingTo(null);
      } else {
        // Adding a new comment
        const commentData = {
          userName: userName,
          profileImage: profileImage,
          time: new Date().toISOString(),
          text: newComment,
          replies: [],
        };
        await addDoc(commentsRef, commentData);
      }
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Header onGoBack={handleGoBack} content="Comments"/>

      {/* Display the comments */}
      <CommentList 
        comments={comments} 
        onDelete={handleDeleteComment} 
        onReply={handleReplyToComment} 
      />

      {/* Replying to comment UI */}
      {replyingTo && (
        <View style={styles.replyInfo}>
          <Text>
          Replying to <Text style={styles.userName}>{replyingTo.userName}</Text>
          </Text>
          <TouchableOpacity onPress={handleCancelReply}>
            <FontAwesome name="times" size={20} color="red" />
          </TouchableOpacity>
        </View>
      )}

      {/* Add a comment */}
      <View style={styles.addComment}>
        <TextInput 
          style={styles.input} 
          placeholder="Add a comment..."
          value={newComment} 
          onChangeText={setNewComment} 
        />
        <TouchableOpacity onPress={handleAddComment}>
          <FontAwesome name="send" size={24} color="black" />
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
  replyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',  // Ajoute de l'espace entre le texte et le bouton
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
  userName: {
    fontWeight: 'bold',
    color: '#007BFF', 
  },
});
