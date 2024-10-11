import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView, Modal } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import FooterMenu from './../components/FooterMenu';
import Header from '../components/Header';
import { WebView } from 'react-native-webview';
import { useAuth } from '../context/authContext';

const Annonce = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [emojiModalVisible, setEmojiModalVisible] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [expandedMedia, setExpandedMedia] = useState({});
  const [currentPostId, setCurrentPostId] = useState(null);
  const { user } = useAuth();
  const [currentUser,setcurrentUser] = useState(user.username); // Remplacez par votre logique d'authentification utilisateur

  const handleGoBack = () => {
    navigation.goBack();
  };

  const fetchPosts = async () => {
    const postsCollection = collection(db, 'annonces');
    const postsSnapshot = await getDocs(postsCollection);
    const postsList = postsSnapshot.docs.map(doc => {
      const data = doc.data();
      console.log(data); // Ajoutez cette ligne pour voir la structure des données
      // Vérifiez et initialisez likes comme un tableau vide si ce n'est pas un tableau
      return {
        id: doc.id,
        ...data,
        likes: Array.isArray(data.likes) ? data.likes : [] // S'assurez que likes est un tableau
      };
    });
    setPosts(postsList);
  };
  

  useEffect(() => {
    fetchPosts();
  }, []);
  //date formate
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleLike = async (postId, emojiType) => {
    const postRef = doc(db, 'annonces', postId);
    const post = posts.find(p => p.id === postId);
    
    // Vérifiez si l'utilisateur a déjà réagi
    const existingReactionIndex = post.likes.findIndex(like => like.username === currentUser);
    
    // Copiez les likes existants pour la mise à jour
    let updatedLikes = [...(post.likes || [])];

    if (existingReactionIndex !== -1) {
      // Si l'utilisateur a déjà réagi, vérifiez la réaction actuelle
      const existingReaction = updatedLikes[existingReactionIndex];

      if (existingReaction.emoji === emojiType) {
        // Si l'utilisateur clique sur le même emoji, supprimer la réaction
        updatedLikes.splice(existingReactionIndex, 1);
      } else {
        // Si l'utilisateur change de réaction, remplacez l'ancienne réaction
        updatedLikes[existingReactionIndex] = { emoji: emojiType, username: currentUser };
      }
    } else {
      // Si l'utilisateur n'a pas encore réagi, ajoutez une nouvelle réaction
      updatedLikes.push({ emoji: emojiType, username: currentUser });
    }

    // Mettez à jour Firestore avec la nouvelle structure de likes
    await updateDoc(postRef, {
      likes: updatedLikes
    });

    fetchPosts(); // Rafraîchir les publications après la mise à jour
  };

  const handleMediaPress = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
  };

  const toggleExpandPost = (postId) => {
    setExpandedPosts((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  const toggleExpandMedia = (postId) => {
    setExpandedMedia((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header onGoBack={handleGoBack} content="Annonces" />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
        {posts.map((post) => (
          <View key={post.id} style={styles.postContainer}>
            <View style={styles.header}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                style={styles.profilePic}
              />
              <View style={styles.postInfo}>
                <Text style={styles.userName}>{post.username}</Text>
                <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
              </View>
            </View>

            <Text style={styles.title}>{post.title}</Text>
            <Text numberOfLines={expandedPosts[post.id] ? undefined : 2} style={styles.postText}>
              {post.description}
            </Text>
            <TouchableOpacity onPress={() => toggleExpandPost(post.id)} style={styles.moreLessButton}>
              <Text style={styles.moreLessText}>{expandedPosts[post.id] ? 'Less...' : 'More...'}</Text>
            </TouchableOpacity>

            <View style={styles.mediaContainer}>
              {post.piece && post.piece.length > 0 && (
                <>
                  {post.piece.slice(0, expandedMedia[post.id] ? post.piece.length : 1).map((media, index) => (
                    <View key={index}>
                      {media.type === 'image' ? (
                        <TouchableOpacity onPress={() => handleMediaPress(media.lien)}>
                          <Image source={{ uri: media.lien }} style={styles.mediaThumbnail} />
                        </TouchableOpacity>
                      ) : media.type === 'video' ? (
                        <View style={styles.videoContainer}>
                          <WebView
                            source={{ uri: media.lien }}
                            style={styles.video}
                            javaScriptEnabled={true}
                            allowsFullscreenVideo={true}
                          />
                        </View>
                      ) : null}
                    </View>
                  ))}
                  {post.piece.length > 1 && (
                    <TouchableOpacity onPress={() => toggleExpandMedia(post.id)}>
                      <Text style={styles.moreButton}>{expandedMedia[post.id] ? 'Less...' : 'More...'}</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            <View style={styles.likesSection}>
  <TouchableOpacity onPress={() => handleLike(post.id, 'like')}>
    <Text>👍 {Array.isArray(post.likes) ? post.likes.filter(like => like.emoji === 'like').length : 0}</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => handleLike(post.id, 'love')}>
    <Text>❤️ {Array.isArray(post.likes) ? post.likes.filter(like => like.emoji === 'love').length : 0}</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => handleLike(post.id, 'laugh')}>
    <Text>😂 {Array.isArray(post.likes) ? post.likes.filter(like => like.emoji === 'laugh').length : 0}</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => handleLike(post.id, 'sad')}>
    <Text>😢 {Array.isArray(post.likes) ? post.likes.filter(like => like.emoji === 'sad').length : 0}</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => navigation.navigate('Comments', { postId: post.id })}>
    <Text style={styles.commentsCount}>{post.comments?.nombre || 0} 💬</Text>
  </TouchableOpacity>
</View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setCurrentPostId(post.id);
                  setEmojiModalVisible(true);
                }}>
                <Text style={styles.actionText}>React</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('CommentsPage', { postId: post.id })} style={styles.actionButton}>
                <Text style={styles.actionText}> Comments</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={emojiModalVisible}
        onRequestClose={() => setEmojiModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Choose an emoji</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => { handleLike(currentPostId, 'like'); setEmojiModalVisible(false); }}>
              <Text style={styles.modalButtonText}>👍 Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => { handleLike(currentPostId, 'love'); setEmojiModalVisible(false); }}>
              <Text style={styles.modalButtonText}>❤️ Love</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => { handleLike(currentPostId, 'laugh'); setEmojiModalVisible(false); }}>
              <Text style={styles.modalButtonText}>😂 Laugh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => { handleLike(currentPostId, 'sad'); setEmojiModalVisible(false); }}>
              <Text style={styles.modalButtonText}>😢 Sad</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEmojiModalVisible(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FooterMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  postContainer: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  postText: {
    fontSize: 14,
    marginVertical: 5,
  },
  moreLessButton: {
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  moreLessText: {
    color: '#007bff',
  },
  mediaContainer: {
    marginVertical: 10,
  },
  mediaThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  videoContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  likesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  commentsCount: {
    marginLeft: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  actionText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  modalButton: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#007bff',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
  },
  modalCloseButton: {
    marginTop: 15,
  },
  modalCloseButtonText: {
    color: '#007bff',
  },
});

export default Annonce;
