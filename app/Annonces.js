import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import FooterMenu from './../components/FooterMenu';
import Header from '../components/Header';
import AntDesign from '@expo/vector-icons/AntDesign';
import { widthPercentageToDP as wp, heightPercentageToDP as wd } from 'react-native-responsive-screen';
import FontAwesome from '@expo/vector-icons/FontAwesome';
const Annonce = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);

  const handleGoBack = () => {
    navigation.goBack(); // Naviguer vers l'écran précédent
  };

  // Récupérer les publications depuis Firestore
  const fetchPosts = async () => {
    const postsCollection = collection(db, 'annonces');
    const postsSnapshot = await getDocs(postsCollection);
    const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPosts(postsList);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Format des timestamps Firestore
  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString();
    }
    return '';
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
                <Text style={styles.userName}>{post.userId || 'Unknown User'}</Text>
                <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
              </View>
            </View>

            {post.image && (
              <Image
                source={{ uri: post.image }}
                style={styles.postImage}
              />
            )}

            {/* Post Text */}
            <Text style={styles.postText}>
              {post.text || 'No text available'}
            </Text>

            {/* Likes */}
            <View style={styles.likesSection}>
              <Text>👍 {post.likes || 0}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton}>
              <AntDesign name="like2" size={wd(3)} color="white" />
              </TouchableOpacity>
              {/* Navigation vers CommentsPage avec le postId */}
              <TouchableOpacity onPress={() => navigation.navigate('CommentsPage', { postId: post.id })} style={styles.actionButton}>
              <FontAwesome name="comment-o" size={24} color="white" />
                            </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <FooterMenu />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
    padding: 10,
  },
  scrollContent: {
    paddingBottom: 60, // To avoid overlap with the footer
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
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
    flexDirection: 'column',
  },
  userName: {
    fontWeight: 'bold',
    color: '#365899',
  },
  timestamp: {
    color: '#606770',
    fontSize: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  postText: {
    paddingVertical: 5,
  },
  likesSection: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    padding: 10,
    backgroundColor: '#4267B2',
    borderRadius: 10,
    marginRight: 5,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff', // Optional: Set a background color for the footer
    borderTopWidth: 1,
    borderColor: '#eaeaea',
  },
  headerContainer: {
    paddingTop: 30, // Ajoutez ici le padding supérieur
  },
});

export default Annonce;
