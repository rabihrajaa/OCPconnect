import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { blurhash, getRoomId } from '../utils/common';
import { doc, collection, query, orderBy, onSnapshot, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function ChatItem({ item, router, noBorder, currentUser, inChat }) {
    const [lastMessage, setLastMessage] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const roomId = getRoomId(currentUser?.userId, item?.userId);
        const docRef = doc(db, 'rooms', roomId);
        const messagesRef = collection(docRef, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'desc'));

        const unsubMessages = onSnapshot(q, (snapshot) => {
            const allMessages = snapshot.docs.map(doc => doc.data());
            setLastMessage(allMessages[0] || null);

            // Count unread messages
            const unreadMessages = allMessages.filter(msg => !msg.isRead && msg.userId !== currentUser?.userId);
            setUnreadCount(unreadMessages.length);
        });

        return () => {
            unsubMessages();
        };
    }, [currentUser, item, inChat]);

    useEffect(() => {
        if (inChat) {
            Alert.alert("inchat", "inchat");
        } else {
            Alert.alert("outchat", "outchat");
        }
    }, [inChat]);

    const markMessagesAsRead = async () => {
        const roomId = getRoomId(currentUser?.userId, item?.userId);
        const docRef = doc(db, 'rooms', roomId);
        const messagesRef = collection(docRef, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'desc'));

        const snapshot = await getDocs(q);
        snapshot.forEach(async (doc) => {
            if (doc.data().userId !== currentUser?.userId && !doc.data().isRead) {
                await updateDoc(doc.ref, { isRead: true });
            }
        });
    };

    const openChatRoom = () => {
        router.push({ pathname: '/chatRoom', params: item });
        markMessagesAsRead();
    };

    const formatTime = date => {
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const isSameDay = (d1, d2) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const isYesterday = date => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return isSameDay(date, yesterday);
    };

    const renderTime = () => {
        if (lastMessage) {
            const date = new Date(lastMessage?.createdAt?.seconds * 1000);
            const now = new Date();

            if (isSameDay(date, now)) {
                return formatTime(date);
            } else if (isYesterday(date)) {
                return 'Yesterday';
            } else {
                return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            }
        }
        return 'Time';
    };

    const renderLastMessage = () => {
        if (lastMessage) {
            return currentUser?.userId === lastMessage?.userId
                ? `You: ${lastMessage?.text}`
                : lastMessage?.text;
        }
        return 'Loading...';
    };

    return (
        <TouchableOpacity
            onPress={openChatRoom}
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: wp(4),
                alignItems: 'center',
                gap: wp(3),
                marginBottom: hp(1),
                paddingBottom: hp(1),
                borderBottomColor: '#E8E8E8',
                borderBottomWidth: noBorder ? 0 : 1
            }}
        >
            <Image
                source={{ uri: item?.profileUrl }}
                style={{ height: hp(6), width: hp(6), borderRadius: hp(3) }}
                placeholder={blurhash}
                transition={500}
            />
            <View style={{ flex: 1, gap: hp(0.5) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: hp(1.8), fontWeight: '600', color: '#1f2937' }}>{item?.username}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {unreadCount > 0 && (
                            <View style={{
                                backgroundColor: 'blue',
                                borderRadius: hp(1.5),
                                width: hp(3),
                                height: hp(3),
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: wp(2)
                            }}>
                                <Text style={{ color: 'white', fontSize: hp(1.6) }}>{unreadCount}</Text>
                            </View>
                        )}
                        <Text style={{ fontSize: hp(1.6), fontWeight: '500', color: unreadCount > 0 ? 'blue' : '#6b7280' }}>
                            {renderTime()}
                        </Text>
                    </View>
                </View>
                <Text style={{ fontSize: hp(1.6), fontWeight: '500', color: '#6b7280' }}>
                    {renderLastMessage()}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
