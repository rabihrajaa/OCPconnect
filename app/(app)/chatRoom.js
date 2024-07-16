import { TextInput, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import ChatRoomHeader from "../../components/ChatRoomHeader";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MessagesList from "../../components/MessagesList";
import { Feather } from "@expo/vector-icons";
import CustomKeyboardView from "../../components/CustomKeyboardView";

export default function ChatRoom() {
    const item = useLocalSearchParams();
    const router = useRouter();
    const [messages, setMessages] = useState([]);

    return (
        <CustomKeyboardView inChat={true}>
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <StatusBar style="dark" />
            <ChatRoomHeader user={item} router={router} />
            <View style={{ height: 3, borderBottomColor: '#D1D5DB', borderBottomWidth: 1 }} />
            <View style={{ flex: 1, justifyContent: 'space-between', backgroundColor: '#F3F4F6', overflow: 'visible' }}>
                <View style={{ flex: 1 }}>
                    <MessagesList messages={messages} />
                </View>
                <View style={{ marginBottom: hp(1.7), paddingTop: 2 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'white', borderWidth: 1, padding: hp(1.5), borderColor: '#D1D5DB', borderRadius: 50, paddingLeft: wp(5) }} className="mx-3">
                            <TextInput 
                                placeholder="Type message..."
                                style={{ fontSize: hp(2.2), flex: 1, marginRight: wp(2) }}
                            />
                            <TouchableOpacity style={{ backgroundColor: '#E5E7EB', padding: hp(1), borderRadius: 50 }}>
                                <Feather name="send" size={hp(3)} color="#737373" />
                            </TouchableOpacity>
                        </View>
                </View>
            </View>
        </View>
     </CustomKeyboardView>    
    );
}
