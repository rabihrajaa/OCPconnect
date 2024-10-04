
import React from 'react';
import { View, Text, Image, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const comments = [
  {
    username: 'ai.skills',
    time: '3d',
    content: 'I like your content very much! Keep it going! ❤️⭐',
    replies: [
      {
        username: 'yoursuccessstory',
        time: '3d',
        content: "Thanks so much! We're glad you're enjoying our content! Keep following for more inspiration! 🌟💪",
      },
    ],
  },
  {
    username: 'the.podcasterr',
    time: '1h',
    content: '@ai.skills the content is great 🔥',
    likes: 1,
  },
  {
    username: 'yoursuccessstory',
    time: '1h',
    content: "Thanks, @ai.skills! Glad you're enjoying the content! Keep being awesome! 🔥💪",
  },
  {
    username: 'bogdann911',
    time: '56m',
    content: '@ai.skills I like it too, it is dope 🔥🔥',
    replies: [
      {
        username: 'yoursuccessstory',
        time: '56m',
        content: "Hey @ai.skills! We're glad you like it!",
      },
    ],
  },
];

export default function Comments() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Comments</Text>
        <View style={styles.headerIcons}>
          <FontAwesome name="info-circle" size={24} color="black" />
          <FontAwesome name="ellipsis-h" size={24} color="black" style={{ marginLeft: 10 }} />
        </View>
      </View>
      <ScrollView style={styles.commentsContainer}>
        {comments.map((comment, index) => (
          <View key={index}>
            <Comment comment={comment} />
            {comment.replies && comment.replies.map((reply, replyIndex) => (
              <Comment key={replyIndex} comment={reply} isReply />
            ))}
          </View>
        ))}
      </ScrollView>
      <View style={styles.emojiBar}>
        <FontAwesome name="heart" size={24} color="black" />
        <FontAwesome name="praying-hands" size={24} color="black" />
        <FontAwesome name="fire" size={24} color="black" />
        <FontAwesome name="clap" size={24} color="black" />
        <FontAwesome name="sad-tear" size={24} color="black" />
        <FontAwesome name="heart-eyes" size={24} color="black" />
        <FontAwesome name="surprise" size={24} color="black" />
        <FontAwesome name="laugh-squint" size={24} color="black" />
      </View>
      <View style={styles.addComment}>
        <TextInput style={styles.input} placeholder="Add a comment..." />
        <FontAwesome name="gift" size={24} color="black" />
      </View>
    </View>
  );
}

function Comment({ comment, isReply }) {
  return (
    <View style={[styles.comment, isReply && styles.reply]}>
      <Image
        source={{ uri: 'https://placehold.co/40x40' }}
        style={styles.avatar}
      />
      <View style={styles.content}>
        <View style={styles.commentHeader}>
          <Text style={styles.username}>{comment.username}</Text>
          <Text style={styles.time}>{comment.time}</Text>
        </View>
        <Text>{comment.content}</Text>
        <View style={styles.actions}>
          <Text>Reply</Text>
          {!isReply && <Text style={styles.hide}>Hide</Text>}
          <View style={styles.like}>
            <FontAwesome name="heart-o" size={16} color="black" />
            {comment.likes && <Text style={styles.likesCount}>{comment.likes}</Text>}
          </View>
        </View>
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
  commentsContainer: {
    paddingHorizontal: 20,
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  reply: {
    marginLeft: 50,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontWeight: 'bold',
  },
  time: {
    marginLeft: 10,
    color: 'gray',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  hide: {
    marginLeft: 20,
  },
  like: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCount: {
    marginLeft: 5,
  },
  emojiBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
