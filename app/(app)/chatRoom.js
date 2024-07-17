import { Keyboard, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import ChatRoomHeader from "../../components/ChatRoomHeader";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MessagesList from "../../components/MessagesList";
import { Feather } from "@expo/vector-icons";
import CustomKeyboardView from "../../components/CustomKeyboardView";
import { useAuth } from "../../context/authContext";
import { getRoomId } from "../../utils/common";
import { collection, addDoc,setDoc, doc, Timestamp,query,orderBy,onSnapshot } from 'firebase/firestore';
import { db } from "../../firebaseConfig";

export default function ChatRoom() {
    const item = useLocalSearchParams(); //second user
    const { user } = useAuth(); //logged in user
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const textRef = useRef('');
    const inputRef=useRef(null);
    const ScrollViewRef=useRef(null);

    useEffect(() => {
        createRoomIfNotExists();

        let roomId=getRoomId(user?.userId,item?.userId);
        const docRef=doc(db,"rooms",roomId);
        const messagesRef = collection (docRef, "messages");
        const q = query (messagesRef, orderBy('createdAt', 'asc'));

        let unsub = onSnapshot (q, (snapshot)=>{
            let allMessages = snapshot.docs.map(doc=>{
                return doc.data();
            });
            setMessages ([...allMessages]);
        });   

        const keyboardDidShowListener=Keyboard.addListener(
            'keyboardDidShow',updateScrollView
        )

        return ()=>{
            unsub();
            keyboardDidShowListener.remove();
        }
    },[]);    

    useEffect (() =>{
        updateScrollView();
    },[messages])
        const updateScrollView = ()=>{
        setTimeout(()=>{
        ScrollViewRef?.current?.scrollToEnd({animated: true})
        },100)
        }

    const createRoomIfNotExists = async () => {
        //roomId
        let roomId = getRoomId(user?.userId, item?.userId);
        await setDoc(doc(db, "rooms", roomId), {
            roomId,
            createdAt: Timestamp.fromDate(new Date())
        });
    }

    const hanldeSendMessage = async () => {
        console.log('rrrrrrrrrrrrrr');
        let message = textRef.current.trim();
        if (!message) return;
        try{
         let roomId = getRoomId(user?.userId, item?.userId);
         const docRef = doc(db, 'rooms', roomId);
         const messagesRef = collection(docRef, "messages");
         textRef.current="";
         if(inputRef) inputRef?.current?.clear();
         const newDoc = await addDoc(messagesRef, {
            userId: user?.userId,
            text: message,
            profileUrl: user?.profileUrl,
            senderName: user?.username,
            createdAt: Timestamp.fromDate(new Date())
        });
        console.log('new message id: ', newDoc.id);
        }catch (err) {
        Alert.alert('Message', err.message);
        }
    }


    return (
        <CustomKeyboardView inChat={true}>
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <StatusBar style="dark" />
                <ChatRoomHeader user={item} router={router} />
                <View style={{ height: 3, borderBottomColor: '#D1D5DB', borderBottomWidth: 1 }} />
                <View style={{ flex: 1, justifyContent: 'space-between', backgroundColor: '#F3F4F6', overflow: 'visible' }}>
                    <View style={{ flex: 1 }}>
                        <MessagesList ScrollViewRef={ScrollViewRef} messages={messages} currentUser={user} />
                    </View>
                    <View style={{ marginBottom: hp(1.7), paddingTop: 2 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'white', borderWidth: 1, padding: hp(1.5), borderColor: '#D1D5DB', borderRadius: 50, paddingLeft: wp(5) }} className="mx-3">
                            <TextInput
                                ref={inputRef}
                                onChangeText={value => textRef.current = value}
                                placeholder="Type message..."
                                style={{ fontSize: hp(2.2), flex: 1, marginRight: wp(2) }}
                            />
                            <TouchableOpacity onPress={hanldeSendMessage} style={{ backgroundColor: '#E5E7EB', padding: hp(1), borderRadius: 50 }}>
                                <Feather name="send" size={hp(3)} color="#737373" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    );
}
