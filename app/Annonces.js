import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView, Modal } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import FooterMenu from './../components/FooterMenu';
import Header from '../components/Header';
import { WebView } from 'react-native-webview';
import { useAuth } from '../context/authContext';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons'; // Utilisation des icônes FontAwesome5 pour certaines icônes

const Annonce = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [expandedMedia, setExpandedMedia] = useState({});
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState(user.username); // Remplacez par votre logique d'authentification utilisateur
  const [userProfileUrl, setUserProfileUrl] = useState({});

  const fetchPosts = async () => {
    const postsCollection = collection(db, 'annonces');
    
    try {
      const postsSnapshot = await getDocs(postsCollection);
      const postsList = await Promise.all(postsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Récupération des commentaires pour chaque post
        const commentsCollection = collection(db, 'annonces', doc.id, 'comments');
        const commentsSnapshot = await getDocs(commentsCollection);
        
        // Compter le nombre de commentaires
        const totalComments = commentsSnapshot.size;
  
        // Calculer le nombre total de réponses
        const totalReplies = commentsSnapshot.docs.reduce((acc, commentDoc) => {
          const commentData = commentDoc.data();
          const repliesCount = Array.isArray(commentData.replies) ? commentData.replies.length : 0;
          return acc + repliesCount;
        }, 0);
        
        return {
          id: doc.id,
          ...data,
          likes: Array.isArray(data.likes) ? data.likes : [],
          totalCommentsAndReplies: totalComments + totalReplies, // Total des commentaires et réponses
        };
      }));
      
      console.log("Rendering post.totalCommentsAndReplies:", postsList);
      setPosts(postsList);
    } catch (error) {
      console.error('Erreur lors du fetch des posts :', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      loadProfileUrls(); // Chargement des URLs des profils après que les posts sont récupérés
    }
  }, [posts]);


  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleLike = async (postId, emojiType) => {
    const postRef = doc(db, 'annonces', postId);
    const post = posts.find(p => p.id === postId);

    const existingReactionIndex = post.likes.findIndex(like => like.username === currentUser);
    let updatedLikes = [...(post.likes || [])];

    if (existingReactionIndex !== -1) {
      const existingReaction = updatedLikes[existingReactionIndex];
      if (existingReaction.emoji === emojiType) {
        updatedLikes.splice(existingReactionIndex, 1); // Supprimer la réaction
      } else {
        updatedLikes[existingReactionIndex] = { emoji: emojiType, username: currentUser }; // Mettre à jour la réaction
      }
    } else {
      updatedLikes.push({ emoji: emojiType, username: currentUser }); // Ajouter une nouvelle réaction
    }

    await updateDoc(postRef, {
      likes: updatedLikes
    });

    fetchPosts();
  };

  const handleMediaPress = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
  };

  const toggleExpandPost = (postId) => {
    setExpandedPosts(prevState => ({
      ...prevState,
      [postId]: !prevState[postId]
    }));
  };

  const toggleExpandMedia = (postId) => {
    setExpandedMedia(prevState => ({
      ...prevState,
      [postId]: !prevState[postId]
    }));
  };


  // Fonction qui met à jour l'URL du profil de chaque utilisateur
  // Fonction pour récupérer l'URL du profil d'un utilisateur à partir de son `username`
  const getUserProfileUrl = async (username) => {
    try {
      const usersCollection = collection(db, 'users');
      const querySnapshot = await getDocs(usersCollection);
      const userDoc = querySnapshot.docs.find(doc => doc.data().username === username);

      if (userDoc) {
        return userDoc.data().profileUrl;
      } else {
        console.log(`Aucun utilisateur trouvé pour ${username}`);
        return null; // ou une URL par défaut
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil de l\'utilisateur:', error);
      return null; // ou une URL par défaut
    }
  };

  const loadProfileUrls = async () => {
    let profileUrls = {};
    for (const post of posts) {
      const profileUrl = await getUserProfileUrl(post.username);
      if (profileUrl) {
        profileUrls[post.username] = profileUrl;
      }
    }
    setUserProfileUrl(profileUrls);
  };



  return (
    <View style={styles.container}>
      <View style={{ marginTop: 35, marginBottom: 20 }}>
        <Header content="Annonces" />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
        {posts.map((post) => (
          <View key={post.id} style={styles.postContainer}>
            <View style={styles.header}>
              <Image
                source={{ uri: userProfileUrl[post.username] || 'https://randomuser.me/api/portraits/men/32.jpg' }}
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
              <TouchableOpacity
                onPress={() => handleLike(post.id, 'like')}
                style={[
                  styles.emojiButton,
                  post.likes.some(like => like.username === currentUser && like.emoji === 'like') && { backgroundColor: '#cce0ff' }, // Arrière-plan plus clair pour "Like"
                ]}
              >
                <FontAwesome name="thumbs-up" size={24} color="blue" />
                <Text> {post.likes.filter(like => like.emoji === 'like').length}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleLike(post.id, 'love')}
                style={[
                  styles.emojiButton,
                  post.likes.some(like => like.username === currentUser && like.emoji === 'love') && { backgroundColor: '#ffd1dc' }, // Arrière-plan plus clair pour "Love"
                ]}
              >
                <FontAwesome name="heart" size={24} color="red" />
                <Text> {post.likes.filter(like => like.emoji === 'love').length}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleLike(post.id, 'laugh')}
                style={[
                  styles.emojiButton,
                  post.likes.some(like => like.username === currentUser && like.emoji === 'laugh') && { backgroundColor: '#fff0b3' }, // Arrière-plan plus clair pour "Laugh"
                ]}
              >
                <FontAwesome5 name="laugh" size={24} color="orange" />
                <Text> {post.likes.filter(like => like.emoji === 'laugh').length}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleLike(post.id, 'sad')}
                style={[
                  styles.emojiButton,
                  post.likes.some(like => like.username === currentUser && like.emoji === 'sad') && { backgroundColor: '#e0e0e0' }, // Arrière-plan plus clair pour "Sad"
                ]}
              >
                <FontAwesome5 name="sad-tear" size={24} color="gray" />
                <Text> {post.likes.filter(like => like.emoji === 'sad').length}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('CommentsPage', { announcementId: post.id })}
                style={styles.emojiButton}
              >
                <FontAwesome name="comments" size={24} color="green" />
                <Text> {post.totalCommentsAndReplies || 0}</Text>
                </TouchableOpacity>


            </View>

          </View>
        ))}
      </ScrollView>

      <FooterMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  scrollView: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: '#fff',
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    borderTopWidth: 2, // Ajout de la bordure en haut
    borderTopColor: '#ddd', // Couleur de la bordure
    shadowColor: '#000',
    shadowOpacity: 0.2, // Augmentation de l'ombre pour la visibilité
    shadowOffset: { width: 0, height: -4 }, // Ombre dirigée vers le haut
    shadowRadius: 8,
    elevation: 5, // L'élévation peut aussi augmenter l'ombre sur Android
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postInfo: {
    marginLeft: 10,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  postText: {
    fontSize: 14,
    color: '#333',
  },
  moreLessText: {
    color: '#007BFF',
    fontSize: 14,
  },
  mediaContainer: {
    marginTop: 15,
  },
  mediaThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20
  },
  videoContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20
  },
  video: {
    width: '100%',
    height: '100%',
  },
  moreButton: {
    color: '#007BFF',
    fontSize: 14,
    marginTop: 5,
  },
  likesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  emojiButton: {
    backgroundColor: '#f0f0f0', // Arrière-plan gris
    padding: 10,
    marginHorizontal: 5, // Espacement entre les boutons
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default Annonce;
