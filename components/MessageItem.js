import React, { useState } from 'react';
import { View, Text, Alert, Modal, TouchableOpacity, Clipboard, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Menu, MenuOptions, MenuTrigger, MenuOption } from 'react-native-popup-menu';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MenuItem } from "./CustomMenuItems";
import styles from '../styles/MessageItemStyles'; // Assurez-vous que ce chemin est correct
import { getDoc, doc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { deleteMessageForMe, deleteMessageForEveryone } from '../utils/messageService';

export default function MessageItem({ message, currentUser, onMessageDeleted }) {
    const [emoji, setEmoji] = useState('emoji-emotions'); // Default emoji icon
    const [isModalVisible, setIsModalVisible] = useState(false);

    const isCurrentUser = currentUser?.userId === message?.userId;
    const isRead = message?.isRead;
    const messageTime = message?.createdAt
        ? new Date(message.createdAt.seconds * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : 'Unknown time';

    const getRoomIdFromMessageId = async (messageId) => {
        try {
            const roomsSnapshot = await getDocs(collection(db, 'rooms'));

            for (const roomDoc of roomsSnapshot.docs) {
                const messagesRef = collection(roomDoc.ref, 'messages');
                const messageDocRef = doc(messagesRef, messageId);
                const messageDoc = await getDoc(messageDocRef);

                if (messageDoc.exists()) {
                    return roomDoc.id;
                }
            }

            console.error(`Message with ID ${messageId} not found in any room.`);
            return null;
        } catch (error) {
            console.error('Error getting room ID from message ID:', error);
            return null;
        }
    };

    const handleDeleteForMe = async () => {
        const roomId = await getRoomIdFromMessageId(message?.id);
        if (message?.id && roomId) {
            await deleteMessageForMe(roomId, message.id);
            onMessageDeleted(); // Appeler la fonction de mise à jour après la suppression
        } else {
            console.error("Message ID or Room ID is missing");
        }
    };

    const handleDeleteForEveryone = async () => {
        const roomId = await getRoomIdFromMessageId(message?.id);
        if (message?.id && roomId) {
            await deleteMessageForEveryone(roomId, message.id);
            onMessageDeleted(); // Appeler la fonction de mise à jour après la suppression
        } else {
            console.error("Message ID or Room ID is missing");
        }
    };

    const handleCopyMessage = () => {
        if (message?.text) {
            Clipboard.setString(message.text);
            Alert.alert('Message', 'Message copied to clipboard.');
        } else {
            console.error("Message text is missing");
        }
    };

    const handleReactWithEmoji = (emoji) => {
        Alert.alert('Reaction', `Reacted with ${emoji}`);
    };

    const openEmojiPicker = () => {
        setIsModalVisible(true);
    };

    const selectEmoji = (selectedEmoji) => {
        setEmoji(selectedEmoji);
        setIsModalVisible(false);
    };

    const emojiList = [
        'emoji-emotions', 'emoji-people', 'emoji-nature', 'emoji-objects', 'emoji-symbols', 'emoji-flags',
        'sentiment-satisfied', 'sentiment-dissatisfied', 'sentiment-neutral', 'sentiment-very-satisfied', 'sentiment-very-dissatisfied'
    ];

    return (
        <View style={isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer}>
            <View style={styles.messageContainer}>
                <Menu>
                    <MenuTrigger>
                        <View style={isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage}>
                            <Text style={styles.messageText}>
                                {message?.text || 'No message text'}
                            </Text>
                            <Text style={styles.messageTime}>
                                {messageTime}
                            </Text>
                        </View>
                    </MenuTrigger>
                    <MenuOptions customStyles={styles.menuOptions}>
                        <MenuItem 
                            text='Delete for me' 
                            action={handleDeleteForMe} 
                            value={null} 
                            icon={<Icon name="delete" size={hp(2.5)} color="green" />} 
                            color="green" 
                        />
                        {isCurrentUser && (
                            <MenuItem 
                                text='Delete for everyone' 
                                action={handleDeleteForEveryone} 
                                value={null} 
                                icon={<Icon name="delete-forever" size={hp(2.5)} color="red" />} 
                                color="red" 
                            />
                        )}
                        <MenuItem 
                            text='Copy message' 
                            action={handleCopyMessage} 
                            value={null} 
                            icon={<Icon name="content-copy" size={hp(2.5)} color="blue" />} 
                            color="blue" 
                        />
                    </MenuOptions>
                </Menu>
                
                {isCurrentUser && (
                    <View style={styles.statusContainer}>
                        {isRead ? (
                            <View style={styles.readCircle} />
                        ) : (
                            <View style={styles.unreadCircle} />
                        )}
                    </View>
                )}
            </View>

            {/* React Menu */}
            <Menu>
                <MenuTrigger onPress={openEmojiPicker}>
                    <Icon name={emoji} size={hp(3)} color="gray" style={styles.reactIcon} />
                </MenuTrigger>
            </Menu>

            {/* Emoji Picker Modal */}
            <Modal visible={isModalVisible} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose an Emoji</Text>
                        <View style={styles.emojiList}>
                            {emojiList.map((emoj) => (
                                <TouchableOpacity key={emoj} onPress={() => selectEmoji(emoj)}>
                                    <Icon name={emoj} size={hp(5)} color="gray" style={styles.emojiIcon} />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );   
}


