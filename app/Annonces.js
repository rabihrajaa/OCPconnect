import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, TextInput, Alert, Text, ScrollView } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const Annonce = () => {
  const navigation = useNavigation(); // Obtenez l'objet navigation
  const [posts, setPosts] = useState([]);

  // Fetch posts from Firestore
  const fetchPosts = async () => {
    const postsCollection = collection(db, 'annonces');
    const postsSnapshot = await getDocs(postsCollection);
    const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPosts(postsList);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Format Firestore timestamps
  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString();
    }
    return '';
  };

  return (
    <ScrollView style={styles.container}> 
      {posts.map((post) => (
        <View key={post.id} style={styles.postContainer}>
          {/* Header */}
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
              <Text style={styles.actionText}>Like</Text>
            </TouchableOpacity>
            {/* Navigation vers CommentsPage avec le postId */}
            <TouchableOpacity onPress={() => navigation.navigate('CommentsPage', { postId: post.id })} style={styles.actionButton}>
              <Text style={styles.actionText}>Comment</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f8f8',
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
});

export default Annonce;
