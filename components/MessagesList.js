import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text } from 'react-native';
import MessageItem from './MessageItem';
import { deleteMessageForMe, deleteMessageForEveryone } from '../utils/messageService'; // Import des fonctions

export default function MessageList({ messages, ScrollViewRef, currentUser }) {
    const [messageList, setMessageList] = useState([]);

    useEffect(() => {
        setMessageList(messages || []);
    }, [messages]);

    const handleDeleteMessageForMe = async (roomId, messageId) => {
        if (!roomId || !messageId) {
            console.error("Invalid parameters for deleting message for me:", { roomId, messageId });
            return;
        }

        try {
            await deleteMessageForMe(roomId, messageId);
            setMessageList(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
        } catch (error) {
            console.error("Error deleting message for me: ", error);
        }
    };

    const handleDeleteMessageForEveryone = async (roomId, messageId) => {
        if (!roomId || !messageId) {
            console.error("Invalid parameters for deleting message for everyone:", { roomId, messageId });
            return;
        }

        try {
            await deleteMessageForEveryone(roomId, messageId);
            setMessageList(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
        } catch (error) {
            console.error("Error deleting message for everyone: ", error);
        }
    };

    return (
        <ScrollView ref={ScrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 10 }}>
            {messageList.length === 0 ? (
                <Text>No messages available</Text>
            ) : (
                messageList.map((message) => (
                    <MessageItem 
                        message={message} 
                        key={message.id}  // Utiliser l'ID unique du message comme clé
                        currentUser={currentUser} 
                        deleteMessageForMe={(messageId) => handleDeleteMessageForMe(message.roomId, messageId)} 
                        deleteMessageForEveryone={(messageId) => handleDeleteMessageForEveryone(message.roomId, messageId)} 
                    />
                ))
            )}
        </ScrollView>
    );
}
