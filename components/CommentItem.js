import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, StyleSheet, Alert } from 'react-native';
import { Menu, MenuOptions, MenuTrigger, MenuOption } from 'react-native-popup-menu';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

export default function CommentItem({ comment, annonceId, currentUserName, onDelete, onReply, onDeleteReply }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalReplayVisible, setisModalReplayVisible] = useState(false);

  const [showReplies, setShowReplies] = useState(false);
  const [profileUrl, setProfileUrl] = useState(null);
  const [selectedReplyId, setSelectedReplyId] = useState(null);
  const [topReactions, setTopReactions] = useState([]);
  const [totalReactions, setTotalReactions] = useState(0);

  const [replyProfileUrl, setReplyProfileUrl] = useState(null); // Pour stocker l'URL de l'image de profil du replyingUser
  const db = getFirestore(); // Initialiser Firestore
  const emojiList = [
    { name: 'like', emoji: '👍', color: '#F4EDD5' },  // Bleu pour "like"
    { name: 'love', emoji: '❤️', color: '#F8B9BA' },  // Rouge pour "love"
    { name: 'laugh', emoji: '😂', color: '#E2EAF4' }, // Jaune pour "laugh"
    { name: 'sad', emoji: '😢', color: '#D2F1C6' },   // Bleu clair pour "sad"
  ];

  // Appeler la fonction pour récupérer l'URL de l'image de profil du commentateur
  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = await getUserByUsername(comment.userName);
      if (user && user.profileUrl) {
        setProfileUrl(user.profileUrl); // Stocker l'URL de l'image dans l'état
      }
    };
    fetchUserProfile();
  }, [comment.userName]);

  useEffect(() => {
    const countAllReactions = () => {
      // Créez un objet pour stocker le compte de chaque emoji
      const reactionCount = comment.likes.reduce((acc, reaction) => {
        // Si l'emoji existe déjà dans l'objet, incrémentez le compte, sinon initialisez à 1
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
        return acc;
      }, {});

      // Formatez les réactions en un tableau avec l'emoji et le nombre
      const formattedReactions = Object.entries(reactionCount).map(([emoji, count]) => ({
        emoji: emojiList.find(e => e.name === emoji)?.emoji || emoji,
        count,
      }));

      // Mettez à jour l'état avec la liste complète des emojis et leur nombre
      setTopReactions(formattedReactions);
      setTotalReactions(Object.values(reactionCount).reduce((a, b) => a + b, 0)); // Total des réactions
    };

    if (comment.likes && comment.likes.length > 0) {
      countAllReactions();
    }
  }, [comment.likes]);


  // Fonction pour rechercher un utilisateur par son username
  const getUserByUsername = async (username) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return { id: querySnapshot.docs[0].id, ...userData };
      } else {
        console.log('User not found');
        return null;
      }
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  };

  const handleDeleteComment = () => {
    onDelete(comment.id);
  };

  const openEmojiPicker = () => {
    setIsModalVisible(true);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Appeler la fonction pour récupérer l'image de profil de chaque replyingUser
  useEffect(() => {
    const fetchReplyUserProfiles = async () => {
      const profiles = await Promise.all(comment.replies.map(async (reply) => {
        const replyUser = await getUserByUsername(reply.userName);
        return replyUser ? replyUser.profileUrl : null;
      }));
      setReplyProfileUrl(profiles);
    };

    if (comment.replies && comment.replies.length > 0) {
      fetchReplyUserProfiles();
    }
  }, [comment.replies]);

  const handleEmojiSelect = async (emoji) => {
    try {
      const db = getFirestore(); // Initialisez Firestore ici

      // Reference to the specific comment document in the 'annonces' collection
      const commentDocRef = doc(db, 'annonces', annonceId, 'comments', comment.id); // Correction de la référence

      // Get the document snapshot
      const commentSnapshot = await getDoc(commentDocRef);

      if (commentSnapshot.exists()) {
        // Get current data from the comment document
        const commentData = commentSnapshot.data();
        const existingReactions = commentData.likes || [];

        // Find if the current user has already reacted
        const existingReactionIndex = existingReactions.findIndex(reaction => reaction.username === currentUserName);

        if (existingReactionIndex >= 0) {
          // User has already reacted; check if the emoji is the same
          if (existingReactions[existingReactionIndex].emoji === emoji) {
            // Same reaction, remove it
            existingReactions.splice(existingReactionIndex, 1);
          } else {
            // Different reaction, update the emoji
            existingReactions[existingReactionIndex].emoji = emoji;
          }
        } else {
          // No previous reaction, add a new one
          existingReactions.push({ emoji, username: currentUserName });
        }
        // Update the comment document with the new likes array
        await updateDoc(commentDocRef, { likes: existingReactions });
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };


  const openEmojiPickerReplay = (replyId) => {
    setSelectedReplyId(replyId);
    setisModalReplayVisible(true);
  };

  const handleReplyEmojiSelect = async (replyIndex, emoji) => {
    try {
      const db = getFirestore(); // Initialisez Firestore ici

      // Référence au document du commentaire dans 'annonces'
      const commentDocRef = doc(db, 'annonces', annonceId, 'comments', comment.id);

      // Récupérer le snapshot du commentaire
      const commentSnapshot = await getDoc(commentDocRef);

      if (commentSnapshot.exists()) {
        // Obtenir les données actuelles du commentaire
        const commentData = commentSnapshot.data();
        const replies = commentData.replies || [];

        // Trouver la réponse spécifique
        // const replyIndex = replies.findIndex(reply => reply.id === replyId);

        if (replyIndex >= 0) {
          const existingReactions = replies[replyIndex].likes || [];

          // Vérifier si l'utilisateur a déjà réagi
          const existingReactionIndex = existingReactions.findIndex(reaction => reaction.username === currentUserName);

          if (existingReactionIndex >= 0) {
            if (existingReactions[existingReactionIndex].emoji === emoji) {
              // Même réaction, la supprimer
              existingReactions.splice(existingReactionIndex, 1);
            } else {
              // Réaction différente, mettre à jour
              existingReactions[existingReactionIndex].emoji = emoji;
            }
          } else {
            // Pas de réaction précédente, en ajouter une nouvelle
            existingReactions.push({ emoji, username: currentUserName });
          }

          // Mettre à jour la réaction dans la réponse spécifique
          replies[replyIndex].likes = existingReactions;

          // Mettre à jour le document du commentaire avec les nouvelles réponses
          await updateDoc(commentDocRef, { replies });
          setisModalReplayVisible(false);
        }
      }
    } catch (error) {
      console.error('Error handling reply reaction:', error);
    }
  };



  return (
    <View style={styles.commentContainer}>
      <Image source={{ uri: profileUrl || "https://cdn-icons-png.flaticon.com/512/4537/4537069.png" }} style={styles.profileImage} />
      <View style={styles.commentContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.username}>{comment.userName || "username"}</Text>
          <Text style={styles.timestamp}>{formatDate(comment.time)}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        {/* Afficher les trois emojis les plus fréquents */}
        {topReactions.length > 0 && (
          <View style={styles.reactionsContainer}>
            {/* Afficher tous les emojis avec leur nombre */}
            {topReactions.map((reaction, index) => (
              <Text key={index} style={styles.reactionItem}>
                {reaction.emoji} {reaction.count}
              </Text>
            ))}
            <Text style={styles.totalReactions}>{totalReactions} Reactions</Text>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={() => onReply(comment.id)}>
            <Icon name="reply" size={18} color="#666" />
          </TouchableOpacity>
          <Menu>
            <MenuTrigger>
              <Icon name="more-vert" size={24} color="gray" />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption onSelect={handleDeleteComment} text="Delete Comment" />
            </MenuOptions>
          </Menu>
          <TouchableOpacity onPress={openEmojiPicker}>
            <Icon name="emoji-emotions" size={18} color="#666" />
          </TouchableOpacity>
        </View>

        {comment.replies && comment.replies.length > 0 && (
          <TouchableOpacity onPress={() => setShowReplies(!showReplies)} style={styles.showRepliesButton}>
            <Text style={styles.showRepliesText}>
              {showReplies ? 'Hide Replies' : `Show Replies (${comment.replies.length})`}
            </Text>
          </TouchableOpacity>
        )}

        {showReplies && comment.replies && comment.replies.map((reply, index) => (
          <View key={reply.id} style={styles.replyContainer}>
            <Image source={{ uri: replyProfileUrl[index] || "https://www.globalfabrications.in/images/user-Icon.jpg" }} style={styles.replyProfileImage} />
            <View style={styles.commentContent}>
              <View style={styles.headerContainer}>
                <Text style={styles.username}>{reply.userName || "username"}</Text>
                <Text style={styles.timestamp}>{formatDate(reply.time)}</Text>
              </View>
              <Text style={styles.commentText}>
                <Text style={styles.userName}>@{comment.userName}</Text> {reply.text}
              </Text>
              <View style={styles.actionsContainer}>
                <TouchableOpacity onPress={() => onReply(comment.id)}>
                  <Icon name="reply" size={18} color="#666" />
                </TouchableOpacity>
                <Menu>
                  <MenuTrigger>
                    <Icon name="more-vert" size={24} color="gray" />
                  </MenuTrigger>
                  <MenuOptions>
                    <MenuOption onSelect={() => onDeleteReply(comment.id, reply.id)} text="Delete Reply" />
                  </MenuOptions>
                </Menu>
                <TouchableOpacity onPress={() => openEmojiPickerReplay(index)}>
                  <Icon name="emoji-emotions" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <Modal visible={isModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose an Emoji</Text>
              <View style={styles.emojiList}>
                {emojiList.map((emoji) => (
                  <TouchableOpacity
                    key={emoji.name}
                    style={[styles.emojiButton, { backgroundColor: emoji.color }]}
                    onPress={() => handleEmojiSelect(emoji.name)}
                  >
                    <Text style={styles.emojiText}>{emoji.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={isModalReplayVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose an Emoji</Text>
              <View style={styles.emojiList}>
                {emojiList.map((emoji) => (
                  <TouchableOpacity
                    key={emoji.name}
                    style={[styles.emojiButton, { backgroundColor: emoji.color }]}
                    onPress={() => handleReplyEmojiSelect(selectedReplyId, emoji.name)}
                  >
                    <Text style={styles.emojiText}>{emoji.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity onPress={() => setisModalReplayVisible(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentContent: {
    marginLeft: 10,
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userName: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    marginTop: 5,
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  showRepliesButton: {
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  showRepliesText: {
    color: '#007BFF',
  },
  replyContainer: {
    flexDirection: 'row',
    marginLeft: 0,
    marginTop: 10,
  },
  replyProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',  // Assombrir l'arrière-plan
  },
  modalContent: {
    width: '85%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',  // Fond blanc pour le modal
    elevation: 5,  // Ajouter une ombre pour l'effet d'élévation
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  emojiList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  emojiButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    elevation: 2,  // Légère ombre pour les boutons emojis
  },
  emojiText: {
    fontSize: 30,  // Emoji plus grand et visible
  },
  modalCloseText: {
    fontSize: 18,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  reactionItem: {
    marginRight: 15,
    fontSize: 16,
  },
  totalReactions: {
    fontWeight: 'bold',
  },
});


