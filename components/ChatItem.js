import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { blurhash, formatDate, getRoomId } from '../utils/common';
import { doc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function ChatItem({ item, router, noBorder, currentUser }) {

    const [lastMessage, setLastMessage] = useState(undefined);

    useEffect(() => {
        let roomId = getRoomId(currentUser?.userId, item?.userId);
        const docRef = doc(db, "rooms", roomId);
        const messagesRef = collection(docRef, "messages");
        const q = query(messagesRef, orderBy('createdAt', 'desc'));

        let unsub = onSnapshot(q, (snapshot) => {
            let allMessages = snapshot.docs.map(doc => doc.data());
            setLastMessage(allMessages[0] ? allMessages[0] : null);
        });
        return unsub;
    }, [currentUser, item]);

    const openChatRoom = () => {
        router.push({ pathname: '/chatRoom', params: item });
    }

    const renderTime = () => {
        if (lastMessage){
            let date = lastMessage?.createdAt;
            return formatDate(new Date(date?.seconds * 1000));
         }
    return 'Time';
}

const renderLastMessage = () => {
    if (typeof lastMessage === 'undefined') return 'Loading...';
    if (lastMessage) {
        if (currentUser?.userId === lastMessage?.userId) return "You: " + lastMessage?.text;
        return lastMessage?.text;
    } else {
        return 'Say Hi';
    }
}

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
            borderBottomWidth: noBorder ? 0 : 1  // Conditionally apply borderBottomWidth
        }}
    >
        <Image
            source={{ uri: item?.profileUrl }}
            style={{ height: hp(6), width: hp(6), borderRadius: hp(3) }}
            placeholder={blurhash}
            transition={500}
        />
        <View style={{ flex: 1, gap: hp(0.5) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: hp(1.8), fontWeight: '600', color: '#1f2937' }}>{item?.username}</Text>
                <Text style={{ fontSize: hp(1.6), fontWeight: '500', color: '#6b7280' }}>
                    {renderTime()}
                </Text>
            </View>
            <Text style={{ fontSize: hp(1.6), fontWeight: '500', color: '#6b7280' }}>
                {renderLastMessage()}
            </Text>
        </View>
    </TouchableOpacity>
);
}
