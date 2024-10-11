import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, StyleSheet, TextInput } from 'react-native';
import { Menu, MenuOptions, MenuTrigger, MenuOption } from 'react-native-popup-menu';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CommentItem({ comment, onDelete, onReply, onDeleteReply }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const handleDeleteComment = () => {
    onDelete(comment.id);
  };


  const openEmojiPicker = () => {
    setIsModalVisible(true);
  };

  const emojiList = [
    'emoji-emotions', 'emoji-people', 'emoji-nature', 'emoji-objects', 'emoji-symbols', 'emoji-flags',
    'sentiment-satisfied', 'sentiment-dissatisfied', 'sentiment-neutral', 'sentiment-very-satisfied', 'sentiment-very-dissatisfied'
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.commentContainer}>
      <Image source={{ uri: comment.profilePicUrl || "https://www.globalfabrications.in/images/user-Icon.jpg" }} style={styles.profileImage} />
      <View style={styles.commentContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.username}>{comment.username || "username"}</Text>
          <Text style={styles.timestamp}>{formatDate(comment.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={() =>onReply(comment.id)}>
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

        {showReplies && comment.replies && comment.replies.map((reply) => (
          <View key={reply.id} style={styles.replyContainer}>
            <Image source={{ uri: reply.profilePicUrl || "https://www.globalfabrications.in/images/user-Icon.jpg" }} style={styles.replyProfileImage} />
            <View style={styles.commentContent}>
              <View style={styles.headerContainer}>
                <Text style={styles.username}>{reply.username || "username"}</Text>
                <Text style={styles.timestamp}>{formatDate(reply.createdAt)}</Text>
              </View>
              <Text style={styles.commentText}>{reply.text}</Text>
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
                <TouchableOpacity onPress={openEmojiPicker}>
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
                  <TouchableOpacity key={emoji} style={styles.emojiButton} onPress={() => setIsModalVisible(false)}>
                    <Icon name={emoji} size={32} color="#fff" />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
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
  username: {
    fontWeight: 'bold',
    fontSize: 14,
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
    alignSelf: 'flex-end', // Move the button to the right
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#7a35f0', // Solid background color instead of gradient
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  emojiList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  emojiButton: {
    marginBottom: 10,
    marginHorizontal: 5,
    backgroundColor: '#e67e22', // Adding a background color to each emoji button
    borderRadius: 8,
    padding: 5,
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
