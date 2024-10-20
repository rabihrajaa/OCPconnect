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
  const [replyingTo, setReplyingTo] = useState(null);
  const navigation = useNavigation();

  const route = useRouter();
  const { announcementId } = useLocalSearchParams();
  const { user } = useAuth();
  const userName = user ? user.username : 'Anonymous';
  const profileImage = user ? user.profileUrl : 'https://www.pngall.com/wp-content/uploads/5/User-Profile-Transparent.png';

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Fonction pour gérer l'ajout ou la mise à jour d'une réaction
  const handleReaction = async (commentId, emoji) => {
    try {
      const commentDocRef = doc(db, 'annonces', announcementId, 'comments', commentId); // Utilisation correcte de 'doc'
      const commentSnapshot = await getDoc(commentDocRef);

      if (commentSnapshot.exists()) {
        const commentData = commentSnapshot.data();
        const existingReactions = commentData.likes || [];

        const existingReactionIndex = existingReactions.findIndex(reaction => reaction.username === userName);

        if (existingReactionIndex >= 0) {
          if (existingReactions[existingReactionIndex].emoji === emoji) {
            existingReactions.splice(existingReactionIndex, 1); // Supprimer la réaction
          } else {
            existingReactions[existingReactionIndex].emoji = emoji; // Mettre à jour la réaction
          }
        } else {
          existingReactions.push({ emoji, username: userName });
        }

        await updateDoc(commentDocRef, { likes: existingReactions });
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };


  // Compter les réactions par emoji
  const countReactions = (reactions, emoji) => {
    return reactions ? reactions.filter(reaction => reaction.emoji === emoji).length : 0;
  };

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

  // Fonction pour supprimer un commentaire
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

  // Fonction pour répondre à un commentaire
  const handleReplyToComment = async (commentId) => {
    try {
      const commentDocRef = doc(db, 'annonces', announcementId, 'comments', commentId);
      const commentSnapshot = await getDoc(commentDocRef);
      if (commentSnapshot.exists()) {
        const commentData = commentSnapshot.data();
        setReplyingTo({ commentId, userName: commentData.userName });
      }
    } catch (error) {
      console.error('Error fetching comment to reply to:', error);
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Ajouter un nouveau commentaire ou une réponse
  const handleAddComment = async () => {
    if (newComment.trim() === '') {
      Alert.alert('Comment cannot be empty!');
      return;
    }

    try {
      const commentsRef = collection(db, 'annonces', announcementId, 'comments');
      if (replyingTo) {
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
      <Header onGoBack={handleGoBack} content="Comments" />

      {/* Affichage des commentaires */}
      <CommentList
        annonceId={announcementId}
        currentUserName={userName}
        comments={comments}
        onDelete={handleDeleteComment}
        onReply={handleReplyToComment}
        onReaction={handleReaction}  // Ajouter la gestion des réactions
      />

      {/* UI pour la réponse à un commentaire */}
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

      {/* Ajouter un commentaire */}
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
    justifyContent: 'space-between',
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
